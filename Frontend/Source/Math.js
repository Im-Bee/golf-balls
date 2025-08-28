// ---------------------------------------------------------------------------------------------------------------------
export function GetMat4x4Id()
{
    return new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
    ]);
}

// ---------------------------------------------------------------------------------------------------------------------
export function GetProjectionMatrix(width, height) 
{
    const fov       = 60 * Math.PI / 180; 
    const near      = 0.1;
    const far       = 1000.0;
    const aspect    = width / height;

    const f         = 1.0 / Math.tan(fov / 2);
    const rangeInv  = 1.0 / (near - far);

    return [
        f / aspect, 0, 0,                              0,
        0,          f, 0,                              0,
        0,          0, (near + far) * rangeInv,       -1,
        0,          0, (2 * near * far) * rangeInv,    0
    ];
}

// ---------------------------------------------------------------------------------------------------------------------
function Normalize(v) 
{
    const len = Math.hypot(...v);
    return len > 0.00001 ? v.map(n => n / len) : [0, 0, 0];
}

// ---------------------------------------------------------------------------------------------------------------------
function Cross(a, b) 
{
    return [
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0]
    ];
}

// ---------------------------------------------------------------------------------------------------------------------
function Dot(a, b) 
{
    return a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
}

// ---------------------------------------------------------------------------------------------------------------------
export function LookAt(eye, target, up) 
{
    const zAxis = Normalize([
        eye[0] - target[0],
        eye[1] - target[1],
        eye[2] - target[2]
    ]);

    const xAxis = Normalize(Cross(up, zAxis));
    const yAxis = Cross(zAxis, xAxis);

    return [
                xAxis[0],         yAxis[0],         zAxis[0], 0,
                xAxis[1],         yAxis[1],         zAxis[1], 0,
                xAxis[2],         yAxis[2],         zAxis[2], 0,
        -Dot(xAxis, eye), -Dot(yAxis, eye), -Dot(zAxis, eye), 1
    ];
}

