import { GetProjectionMatrix } from "../Math.js";

export default class Renderer
{ 
    constructor()
    { this.#InitOpenGL(); }

// Public // -----------------------------------------------------------------------------------------------------------
    Resize()
    {
        const canvas = this.#canvas;

        canvas.height = window.innerHeight;
        canvas.width  = window.innerWidth;

        this.#opengl.viewport(0, 
                              0,
                              canvas.width,
                              canvas.height);
    }

// ---------------------------------------------------------------------------------------------------------------------
    BindObject(object)
    {
        const mesh = object.GetMesh();
    
        var isLoaded = false;
        for (const m of this.#meshes) {
            if (m.GetId() == mesh.GetId()) {
                isLoaded = true;
                break;
            }
        }

        if (!isLoaded) {
            this.#LoadMesh(mesh);
        }

        this.#objects.push(object);
    }

// ---------------------------------------------------------------------------------------------------------------------
    SetCamera(camera)
    { this.#camera = camera; }

// ---------------------------------------------------------------------------------------------------------------------
    Render()
    {   
        if (!this.#shaderProgram) {
            return;
        }

        const gl            = this.#opengl;
        const canvas        = this.#canvas;
        const projection    = GetProjectionMatrix(canvas.width, canvas.height)

        gl.clearColor(0.1, 0.1, 0.1, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        this.#LoadProjection(projection);
        this.#LoadCamera(this.#camera.GetTransformMat());
        this.#LoadCameraPos(this.#camera.GetPos());

        for (const obj of this.#objects) 
        {
            this.#LoadForRender(obj.GetMesh());
            this.#LoadTransformMat(obj.GetTransformMat());

            gl.drawElements(gl.TRIANGLES, obj.GetMesh().GetIndexAmount(), gl.UNSIGNED_SHORT, 0);
        }
    }

// Private // ----------------------------------------------------------------------------------------------------------
    #InitOpenGL()
    {
        this.#CreateContext();
        this.Resize();
        this.#LoadPipeline();
    }

// ---------------------------------------------------------------------------------------------------------------------
    #CreateContext()
    {
        this.#canvas    = document.getElementById('canvas');
        this.#opengl    = this.#canvas.getContext('webgl2');
        this.#objects   = [];
        this.#meshes    = [];

        if (!this.#opengl) {
            alert('WebGL2 not supported');
            throw new Error('WebGL not supported');
        }
    }

// ---------------------------------------------------------------------------------------------------------------------
    async #LoadPipeline()
    {
        const gl = this.#opengl;

        gl.enable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);

        this.#shaderProgram = await this.#LoadShaders();
        gl.useProgram(this.#shaderProgram);
    }

// ---------------------------------------------------------------------------------------------------------------------
    async #LoadShaders()
    {
        const vertexSource   = await this.#LoadShaderSource('Assets/Shaders/vertex.glsl');
        const fragmentSource = await this.#LoadShaderSource('Assets/Shaders/frag.glsl');

        return this.#CreateProgram(vertexSource,
                                   fragmentSource);
    }

// ---------------------------------------------------------------------------------------------------------------------
    async #LoadShaderSource(url) 
    {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to load shader: ${url}`);
        }
        return response.text();
    }

// ---------------------------------------------------------------------------------------------------------------------
    #CreateShader(type, source) 
    {
        const gl        = this.#opengl;
        const shader    = gl.createShader(type);

        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            const err = gl.getShaderInfoLog(shader);
            gl.deleteShader(shader);

            throw new Error('Shader compile error: ' + err);
        }

        return shader;
    }

// ---------------------------------------------------------------------------------------------------------------------
    #CreateProgram(vertexSrc, fragmentSrc)
    {
        const gl                = this.#opengl;
        const vertexShader      = this.#CreateShader(gl.VERTEX_SHADER, vertexSrc);
        const fragmentShader    = this.#CreateShader(gl.FRAGMENT_SHADER, fragmentSrc);
        const program           = gl.createProgram();

        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            const err = gl.getProgramInfoLog(program);
            gl.deleteProgram(program);

            throw new Error('Program link error: ' + err);
        }

        return program;
    }

// ---------------------------------------------------------------------------------------------------------------------
    #LoadBuffers(mesh)
    {
        const gl                = this.#opengl;
        const positionBuffer    = gl.createBuffer();
        const indexBuffer       = gl.createBuffer();
        const normalBuffer      = gl.createBuffer();
        const vertices          = mesh.GetVertices();
        const indexes           = mesh.GetFaces();
        const normals           = mesh.GetNormals();

        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexes, gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);

        mesh.SetGPUVertexBuffer(positionBuffer);
        mesh.SetGPUIndexBuffer(indexBuffer);
        mesh.SetGPUNormalBuffer(normalBuffer);
    }

// ---------------------------------------------------------------------------------------------------------------------
    #LoadForRender(mesh)
    {
        const gl                        = this.#opengl;
        const positionAttribLocation    = gl.getAttribLocation(this.#shaderProgram, 'a_position');
        const normalAttribLocation      = gl.getAttribLocation(this.#shaderProgram, 'a_normal');
        const gpuVertexBuffer           = mesh.GetGPUVertexBuffer();
        const gpuIndexBuffer            = mesh.GetGPUIndexBuffer();
        const gpuNormalBuffer           = mesh.GetGPUNormalBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, gpuVertexBuffer);
        gl.enableVertexAttribArray(positionAttribLocation);
        gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gpuIndexBuffer);

        gl.bindBuffer(gl.ARRAY_BUFFER, gpuNormalBuffer);
        gl.enableVertexAttribArray(normalAttribLocation);
        gl.vertexAttribPointer(normalAttribLocation, 3, gl.FLOAT, false, 0, 0);
    }
// ---------------------------------------------------------------------------------------------------------------------
    #LoadUniformMat(matrix, what)
    {
        const gl        = this.#opengl;
        const program   = this.#shaderProgram;
        const loc       = gl.getUniformLocation(program, what);

        gl.uniformMatrix4fv(loc, false, matrix);
    }

// ---------------------------------------------------------------------------------------------------------------------
    #LoadMesh(mesh)
    {
        this.#LoadBuffers(mesh);
        this.#meshes.push(mesh);
    }

// ---------------------------------------------------------------------------------------------------------------------
    #LoadTransformMat(mat) 
    { this.#LoadUniformMat(mat, "u_transform"); }

// ---------------------------------------------------------------------------------------------------------------------
    #LoadCamera(mat) 
    { this.#LoadUniformMat(mat, "u_camera_view"); }

// ---------------------------------------------------------------------------------------------------------------------
    #LoadProjection(mat) 
    { this.#LoadUniformMat(mat, "u_project"); }

// ---------------------------------------------------------------------------------------------------------------------
    #LoadCameraPos(vec) 
    { 
        const gl        = this.#opengl;
        const program   = this.#shaderProgram;
        const loc       = gl.getUniformLocation(program, "u_camera_pos");

        gl.uniform3fv(loc, vec);
    }


// ---------------------------------------------------------------------------------------------------------------------
    /** @type { HTMLCanvasElement } */
    #canvas;
    /** @type { WebGLRenderingContext } */
    #opengl;

    #shaderProgram;
    
    #camera;
    #objects    = [];
    #meshes     = [];
};
