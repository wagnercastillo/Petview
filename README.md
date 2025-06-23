# Pentview

# Sistema de asistencias

## Técnologias empleadas
* **Servidor A:** NestJS - TypeScript - Postgres - Pgadmin
* **Servidor B:** NestJS - TypeScript - Mongodb - MongoExpress
* **Comunicación Asincronica:** RabbitMQ

## Diagrama de arquitectura

![Diagrama del sistema](./Diagrama%20de%20arquitectura.png)


┌─────────────────────┐         ┌──────────────────────┐
│     SERVIDOR A      │         │     SERVIDOR B       │
│   Gestión Empleados │         │  Control Asistencia  │
│      NestJS :3001   │         │     NestJS :3002     │
└─────────┬───────────┘         └──────────┬───────────┘
          │                                │
          │                                │
          ▼                                ▼
┌─────────────────────┐         ┌─────────────────────┐
│     PostgreSQL      │         │       MongoDB       │
│    empleados_db     │         │    asistencia_db    │
└─────────────────────┘         └─────────────────────┘
          │                                │
          └──────────────┬─────────────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │      RabbitMQ       │
              │ Comunicación Asíncr.│
              │     (Colas)         │
              └─────────────────────┘

# Ejecución del proyecto

```bash
   docker compose up -d
```

# Documentación con Swagger

## Empleados API
```bash
   http://localhost:3001/api/docs
```
## Asistencias API
```bash
   http://localhost:3002/api/docs
```

# Documentación con Postman
[Enlace a documentación con Postman](https://www.postman.com/avionics-geoscientist-22614699/pentview/collection/2e1308u/pentview)

# Funcionamiento de los servidores

🏢 Microservicio A - Gestión de Empleados
1. Controla la información de los empleados. 
   - Crea 
   - Actualiza
   - Elimina
   - Desactiva
   - Lista empleados
   
🐰 RabbitMQ - Intermediario entre las peticiones y respuestas mediante cola asincrona. 

⏰ Microservicio B - Control de Asistencia
1. Controla la asistencia de los empleados
   - Crea registros
   - Actualiza 
   - Elimina
   - Lista registros# Petview
