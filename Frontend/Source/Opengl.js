import Camera   from './Primitives/Camera.js';
import Sphere   from './Primitives/Sphere.js';
import Renderer from './Render/Renderer.js';

const ObjectsAmount = 5;
const CamMoveSpeed  = 0.1;

class App
{
    constructor()
    {
        this.#camera    = new Camera();
        this.#renderer  = new Renderer();

        this.#renderer.SetCamera(this.#camera);
        this.#camera.MovePositionBy([ -5., -5., 1. ]);
        this.#camera.SetRotation(Math.PI * 1.1, Math.PI * -0.12, 0.);
    
        for (var i = 0; i < ObjectsAmount; ++i) {
            this.#objects.push(new Sphere);
            this.#renderer.BindObject(this.#objects[this.#objects.length - 1]);
        }

        window.addEventListener('resize', () => this.#renderer.Resize());
        window.addEventListener('keydown', (event) => this.#HandleKeyDown(event));
    }

    async Run()
    {
        this.#camera.Update();
        
        const fetches = this.#objects.map((_, i) =>
            fetch(`http://localhost:5000/GetPos/${i}`)
            .then(response => response.json())
            .then(data => data.map(Number))
            .catch(error => {
                console.error('Error fetching floats:', error);
                return null;
            })
        );

        (await Promise.all(fetches)).map((matrix, i) => {
            this.#objects[i].Update(matrix);
        });

        if (!requestAnimationFrame(() => this.#renderer.Render())) {
            console.log("requestAnimationFrame() != 0");
        }

        setTimeout(() => this.Run(), 0);
    }

    #HandleKeyDown(event) 
    {
        switch (event.key) 
        {
            case 'ArrowUp':
                this.#camera.MovePositionBy([0, 0, CamMoveSpeed]); 
                break;
            case 'ArrowDown':
                this.#camera.MovePositionBy([0, 0, -CamMoveSpeed]);
                break;
            case 'ArrowLeft':
                this.#camera.MovePositionBy([CamMoveSpeed, 0, 0]);
                break;
            case 'ArrowRight':
                this.#camera.MovePositionBy([-CamMoveSpeed, 0, 0]); 
                break;
            default:
                break;
        }
    }


    #renderer;
    #camera;
    #objects = [];
};

const app = new App();
app.Run();
