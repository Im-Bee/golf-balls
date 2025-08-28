import IObject  from "../Render/Interfaces/IObject.js";
import IMesh    from "../Render/Interfaces/IMesh.js";
import { LookAt } from "../Math.js";

export default class Camera extends IObject
{
    constructor()
    { 
        super(new IMesh()); 

        this.#posVec = [ 0., 0., 0., ];
        this.#rotVec = [ 0., 0., 0., ];
    }

// Public // -----------------------------------------------------------------------------------------------------------
    MovePositionBy(moveBy)
    {
        this.#posVec = [ this.#posVec[0] - moveBy[0],
                         this.#posVec[1] - moveBy[1],
                         this.#posVec[2] - moveBy[2] ];
    }

// ---------------------------------------------------------------------------------------------------------------------
    SetRotation(pitch, yaw, roll)
    {
        this.#rotVec = [ pitch, yaw, roll ];

    }

// ---------------------------------------------------------------------------------------------------------------------
    Update() 
    {
        const forward = [
            Math.cos(this.#rotVec[0]) * Math.cos(this.#rotVec[1]),
            Math.sin(this.#rotVec[0]),
            Math.cos(this.#rotVec[0]) * Math.sin(this.#rotVec[1])
        ];

        const target = [
            this.#posVec[0] + forward[0],
            this.#posVec[1] + forward[1],
            this.#posVec[2] + forward[2]
        ];

        const up = [0., 1., 0.]; // World up
        this._SetTransformMat(LookAt(this.#posVec, target, up));
    }

// ---------------------------------------------------------------------------------------------------------------------
    GetPos()
    { return this.#posVec; }

// ---------------------------------------------------------------------------------------------------------------------
    #posVec;
    #rotVec;

};
