import IObject      from "../Render/Interfaces/IObject.js";
import SphereMesh   from "../MeshGen/Sphere.js"

export default class Sphere extends IObject
{
    constructor()
    { super(new SphereMesh()); }
};
