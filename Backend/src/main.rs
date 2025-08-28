use actix_cors::Cors;
use actix_web::{middleware::Logger, http, web, App, HttpServer};
use self::routes::get_pos;
use self::simulation::{Sim};

mod simulation {
    use std::time::{Duration, Instant};
    use rand::Rng;
    use crate::MAX_ID;

    pub struct V3 {
        pub x: f32,
        pub y: f32,
        pub z: f32,
    }

    #[derive(Clone, Debug)]
    pub struct TransformMatrix {
        mat: Vec<f32>,
        last_update: Instant,
        velocity: f32,
        grounded: bool,
    }

    impl TransformMatrix {
        pub fn new() -> TransformMatrix {
            TransformMatrix {
                mat: (0..16).map(|n| 
                    if (n % 5) == 0 { 
                        1.
                    } else { 
                        0.
                    }
                ).collect(),
                last_update: Instant::now() - Duration::from_secs(2),
                velocity: 0.,
                grounded: false,
            }
        }
        
        #[inline]
        pub fn into_v8(&self) -> Vec::<f32> {
            self.mat.clone()
        }

        #[inline]
        pub fn get_last_update(&mut self) -> &mut Instant {
            &mut self.last_update
        }

        #[inline]
        pub fn simulate(&mut self, delta: f32) -> &mut Self {
            const SCALE: f32 = 0.001;
            const GRAVITY_ACCEL: f32 = 9.81 * SCALE;
            const INDEX: usize = 3 * 4;

            if self.grounded {
                return self;
            }

            self.velocity += -GRAVITY_ACCEL * delta;

            if (self.mat[INDEX + 1] + self.velocity) <= 0. {
                self.mat[INDEX + 1] = 0.;
                self.velocity = -self.velocity * 0.9;

                if self.velocity.abs() < 0.005 {
                    self.velocity = 0.;
                    self.grounded = true;
                }

                return self;
            }
            
            self.move_by(&V3 { x: 0., y: self.velocity, z: 0. });

            self
        }
        
        #[inline]
        fn move_by(&mut self, vec: &V3) -> &mut Self {
            const INDEX: usize = 3 * 4;

            self.mat[INDEX    ] += vec.x;
            self.mat[INDEX + 1] += vec.y;
            self.mat[INDEX + 2] += vec.z;

            self
        }

    }

    pub struct Sim
    {
        objects: std::sync::Arc<tokio::sync::Mutex<Vec<std::sync::Arc<tokio::sync::Mutex<TransformMatrix>>>>>,
    }

    impl Sim {
        pub fn new() -> Sim {
            let index = MAX_ID;
            let now = Instant::now();
            let mut vec = Vec::new();

            let mut random_gen = rand::thread_rng();

            for i in 0..=(index as usize) {
                let offset = 1.2 * i as f32;
                let mut tm = TransformMatrix::new();
                tm.move_by(&V3 { 
                    x: random_gen.gen_range(-25. as f32..0.), 
                    y: random_gen.gen_range(0. as f32..25.),
                    z: offset
                });
                *tm.get_last_update() = now;
                vec.push(std::sync::Arc::new(tm.into()));
            }

            Sim { 
                objects: std::sync::Arc::new(vec.into()),
            }
        }

        pub async fn get_pos_cache(&self, index: u32) -> Vec<f32> {
            const FRAME_RATE:   f32 = 60.;
            const D_FRAME_MS:   f32 = 1. / FRAME_RATE * 1000.;

            let now = Instant::now();

            let transf_mat = self.objects
                .lock()
                .await
                .get_mut(index as usize)
                .unwrap()
                .clone();

            let dur = now.duration_since((*transf_mat.lock().await.get_last_update()).clone());
            *transf_mat.lock().await.get_last_update() = now;

            let as_milis = dur.as_millis() as u32;
            let delta = as_milis as f32 / D_FRAME_MS;

            transf_mat
                .lock()
                .await
                .simulate(delta)
                .into_v8()
        }
    }
}


mod routes {
    use actix_web::{get, web, HttpResponse, Responder};
    use crate::{AppData, MAX_ID};

    #[get("/GetPos/{id}")]
    pub async fn get_pos(pdata: web::Data<AppData>, path: web::Path<u32>) -> impl Responder {
        let id = path.into_inner();

        if id >= MAX_ID {
            return HttpResponse::BadRequest().body("Invalid id");
        }

        HttpResponse::Ok().json(
            pdata
            .sim
            .lock()
            .await
            .get_mut(0)
            .unwrap()
            .get_pos_cache(id)
            .await)
    }
}

static MAX_ID: u32 = 50;

#[derive(Clone)]
struct AppData {
    sim: std::sync::Arc<tokio::sync::Mutex<Vec<Sim>>>,
}

impl AppData {
    fn new() -> AppData {
        let mut vec: Vec::<Sim> = Vec::new();
        vec.push(Sim::new());

        AppData { 
            sim: (std::sync::Arc::new(vec.into())) 
        }
    }
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

    let apd = AppData::new();
    let max_threads_req = std::thread::available_parallelism();
    let max_threads: usize;
    match max_threads_req {
        Ok(v) => max_threads = v.get(),
        Err(_) => max_threads = 1,
    }

    let _ = HttpServer::new(move || {
        let cors = Cors::default()
            .allowed_origin("http://127.0.0.1:8080")
            .allowed_methods(vec!["GET", "POST"])
            .allowed_headers(vec![http::header::AUTHORIZATION, http::header::ACCEPT])
            .allowed_header(http::header::CONTENT_TYPE)
            .max_age(None);

        App::new()
            .app_data(web::Data::new(apd.clone()))
            .wrap(Logger::default())
            .wrap(cors)
            .service(get_pos)
    })
    .workers(max_threads)
    .bind(("127.0.0.1", 5000))?
    .run()
    .await;

    Ok(())
}
