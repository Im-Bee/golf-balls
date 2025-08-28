import IMesh from "../Render/Interfaces/IMesh.js";

export default class SphereMesh extends IMesh
{
    constructor()
    { super(); }

// Public // -----------------------------------------------------------------------------------------------------------
    GetVertices()
    {
        if (this.#vertices.length != 0) {
            return new Float32Array(this.#vertices);
        }
    
        for (let lat = 0; lat <= this.#latSegments; lat++) {
            const theta = lat * Math.PI / this.#latSegments;
            const sinTheta = Math.sin(theta);
            const cosTheta = Math.cos(theta);
    
            for (let lon = 0; lon <= this.#lonSegments; lon++) {
                const phi = lon * 2 * Math.PI / this.#lonSegments;
                const sinPhi = Math.sin(phi);
                const cosPhi = Math.cos(phi);
    
                const x = cosPhi * sinTheta;
                const y = cosTheta;
                const z = sinPhi * sinTheta;
    
                this.#vertices.push(this.#radius * x, this.#radius * y, this.#radius * z);
            }
        }
    
        return new Float32Array(this.#vertices);
    }
    
// ---------------------------------------------------------------------------------------------------------------------
    GetNormals() 
    {
        if (this.#normals.length != 0) {
            return new Float32Array(this.#normals);
        }

        for (let lat = 0; lat <= this.#latSegments; lat++) {
            const theta = lat * Math.PI / this.#latSegments;
            const sinTheta = Math.sin(theta);
            const cosTheta = Math.cos(theta);
    
            for (let lon = 0; lon <= this.#lonSegments; lon++) {
                const phi = lon * 2 * Math.PI / this.#lonSegments;
                const sinPhi = Math.sin(phi);
                const cosPhi = Math.cos(phi);
    
                const x = cosPhi * sinTheta;
                const y = cosTheta;
                const z = sinPhi * sinTheta;
    
                this.#normals.push(x, y, z);
            }
        }
    
        return new Float32Array(this.#normals);
    }
    
// ---------------------------------------------------------------------------------------------------------------------
    GetFaces() 
    {
        if (this.#indices.length != 0) {
            return new Float32Array(this.#indices);
        }
    
        for (let lat = 0; lat < this.#latSegments; lat++) {
            for (let lon = 0; lon < this.#lonSegments; lon++) {
                const first = lat * (this.#lonSegments + 1) + lon;
                const second = first + this.#lonSegments + 1;
    
                this.#indices.push(first, second, first + 1);
                this.#indices.push(second, second + 1, first + 1);
            }
        }
    
        return new Uint16Array(this.#indices);
    }

// Private // ----------------------------------------------------------------------------------------------------------
    #latSegments    = 20; 
    #lonSegments    = 20; 
    #radius         = 0.5;

    #vertices   = [];
    #normals    = [];
    #indices    = [];

};


