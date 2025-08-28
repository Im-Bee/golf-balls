 #version 300 es

precision mediump float;

in vec4 a_position;
in vec3 a_normal;
uniform mat4 u_transform;
uniform mat4 u_camera_view;
uniform vec3 u_camera_pos;
uniform mat4 u_project;

out vec3 pos;
out vec3 Normal;
out vec3 Camera;

void main()
{
    vec4 worldPos   = u_transform * a_position;
    gl_Position     = u_project * u_camera_view * worldPos;

    mat3 normalMatrix = mat3(transpose(inverse(u_transform)));

    Normal  = normalize(normalMatrix * a_normal);
    Camera  = u_camera_pos;
    pos     = vec3(u_transform * a_position);
}
