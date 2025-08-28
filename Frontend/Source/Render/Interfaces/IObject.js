import { GetMat4x4Id } from "../../Math.js";


var id = 0;

export default class IObject 
{
    constructor(mesh)
    { 
        this.#id        = id++; 
        this.#mesh      = mesh;
        this.#matrix    = GetMat4x4Id();
    }

// Public // -----------------------------------------------------------------------------------------------------------
    GetMesh()
    { return this.#mesh; }

// ---------------------------------------------------------------------------------------------------------------------
    SetMesh(mesh)
    { this.#mesh = mesh; }

// ---------------------------------------------------------------------------------------------------------------------
    GetTransformMat()
    { return this.#matrix; }

// ---------------------------------------------------------------------------------------------------------------------
    MovePositionBy(moveBy)
    {
        const matrix = this.#matrix;
        const index = 3 * 4;
        const newPos = [ matrix[index]     + moveBy[0],
                         matrix[index + 1] + moveBy[1],
                         matrix[index + 2] + moveBy[2] ];

        matrix[index    ] = newPos[0];
        matrix[index + 1] = newPos[1];
        matrix[index + 2] = newPos[2];
    }

// ---------------------------------------------------------------------------------------------------------------------
    Update(matrix)
    {
        this._SetTransformMat(matrix);
    }

// Protected // --------------------------------------------------------------------------------------------------------
    _SetTransformMat(matrix)
    { this.#matrix = matrix; }

// Private // ----------------------------------------------------------------------------------------------------------
    #id;
    #mesh;
    #matrix;
};
