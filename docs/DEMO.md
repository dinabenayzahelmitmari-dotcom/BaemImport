# Checklist de Demo (defensa)

1. Arrancar MongoDB
2. Configurar `backend/.env`
3. Cargar datos demo:

```bash
node backend/scripts/seed-demo.js
```

4. Arrancar app:

```bash
npm start
```

5. Flujos a demostrar

- Login vendedor
- Crear vehiculo
- Crear pedido (genera tareas)
- Cambiar fase del pedido (crea notificacion + email)
- Panel de cliente (ver pedidos + notificaciones)

