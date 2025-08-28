#version 300 es
precision mediump float;

in vec3 pos;
in vec3 Normal;
in vec3 Camera;

out vec4 FragColor;

void main()
{
    vec3 lightPos   = vec3(-3.2,  2.0, 2.0);
    vec3 lightColor = vec3(-1.0, -1.5, 1.0);
    vec3 viewPos    = Camera;

    float ambientStrength  = 0.7;
    float diffuseStrength  = 0.4;
    float specularStrength = 1.2;
    float shininess        = 160.0;

    vec3 norm = normalize(Normal);
    vec3 lightDir = normalize(lightPos - pos);
    vec3 viewDir = normalize(viewPos - pos);
    vec3 reflectDir = reflect(-lightDir, norm);

    // Ambient
    vec3 ambient = ambientStrength * lightColor;

    // Diffuse
    float diff = max(dot(norm, lightDir), 0.0);
    vec3 diffuse = diffuseStrength * diff * lightColor;

    // Specular
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
    vec3 specular = specularStrength * spec * lightColor;

    vec3 color = vec3(0.55, 0.55, 0.8); // base color
    vec3 result = (ambient + diffuse + specular) * color;

    FragColor = vec4(result, 1.0);
}

