
// ==========================================
// 1. IMPORTACIÓN DE LIBRERÍAS
// ==========================================

// Permite utilizar las variables privadas del archivo .env
require("dotenv").config()

// Importamos Express para crear nuestro servidor
const express = require("express")

// Importamos Google APIs para trabajar con Google Calendar
const { google } = require("googleapis")


// ==========================================
// 2. CONFIGURACIÓN DEL SERVIDOR
// ==========================================

const app = express()

// Puerto donde se ejecutará nuestro backend
const PORT = 3000


// ==========================================
// 3. CONFIGURACIÓN DE CREDENCIALES
// ==========================================

// Recuperamos las credenciales almacenadas en el archivo .env
const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET
const REDIRECT_URI = process.env.REDIRECT_URI

// Verificamos que las credenciales estén configuradas
if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
    throw new Error("Faltan credenciales en el archivo .env")
}


// ==========================================
// 4. CONFIGURACIÓN DEL CLIENTE OAUTH 2.0
// ==========================================

// Creamos el cliente OAuth para gestionar la autorización
// entre nuestra aplicación y los servicios de Google.
const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
)

// Definimos los permisos que solicitaremos a Google.
// calendar.events permite crear y administrar eventos.
const SCOPES = [
    "https://www.googleapis.com/auth/calendar.events"
]


// ==========================================
// 5. RUTA PRINCIPAL
// ==========================================

// Comprueba que nuestro servidor esté funcionando
app.get("/", (req, res) => {
    res.send("Servidor de ParcheGol funcionando")
})


// ==========================================
// 6. AUTORIZACIÓN CON GOOGLE
// ==========================================

// Esta ruta genera la dirección a la que enviaremos
// al usuario para que autorice el acceso a Google Calendar.
app.get("/auth", (req, res) => {

    const authUrl = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: SCOPES,
        prompt: "consent"
    })

    // Redirigimos al usuario a la página de autorización de Google
    res.redirect(authUrl)
})


// ==========================================
// 7. RESPUESTA DE GOOGLE (CALLBACK)
// ==========================================

// Google redirige al usuario a esta ruta después
// de que autorice o rechace los permisos solicitados.
app.get("/oauth2callback", async (req, res) => {

    try {

        // Recuperamos el código de autorización enviado por Google
        const codigo = req.query.code

        // Si Google no devuelve un código, no podemos continuar
        if (!codigo) {
            return res.status(400).send("No se recibió el código de autorización")
        }

        // Intercambiamos el código por los tokens de acceso
        const { tokens } = await oauth2Client.getToken(codigo)

        // Configuramos el cliente OAuth con los tokens obtenidos
        oauth2Client.setCredentials(tokens)

        // Confirmamos que la autorización fue exitosa
        res.send("¡Google Calendar autorizado correctamente!")

    } catch (error) {

        // Mostramos el error en la terminal del servidor
        console.error("Error durante la autorización:", error)

        res.status(500).send("No fue posible autorizar Google Calendar")
    }
})


// ==========================================
// 8. INICIAR EL SERVIDOR
// ==========================================

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`)
})


// uso de cors

const cors = require("cors")

app.use(cors()) //para el front

app.use(express.json())//para q express tenga los datos 


app.post("/crear-evento", async (req, res) => {  // los datos de una reserva desde el front

    try {
        const {
            nombreCliente,
            correoCliente,
            canchaCliente,
            fechaCliente,
            hInicioCliente,
            hFinalCliente,
            observacionesCliente
        } = req.body

        if (!nombreCliente || !canchaCliente || !fechaCliente ||
            !hInicioCliente || !hFinalCliente) {

            return res.status(400).json({
                mensaje: "Faltan datos para crear la reserva"
            })
        }

        if (!oauth2Client.credentials.access_token) {
            return res.status(401).json({
                mensaje: "Primero debes autorizar Google Calendar"
            })
        }

        const calendar = google.calendar({
            version: "v3",
            auth: oauth2Client
        })

        const evento = {
            summary: `Reserva de cancha: ${canchaCliente}`,
            description: `
                Cliente: ${nombreCliente}
                Correo: ${correoCliente}
                Cancha: ${canchaCliente}
                Observaciones: ${observacionesCliente}
            `,

            start: {
                dateTime: `${fechaCliente}T${hInicioCliente}:00-05:00`,
                timeZone: "America/Bogota"
            },

            end: {
                dateTime: `${fechaCliente}T${hFinalCliente}:00-05:00`,
                timeZone: "America/Bogota"
            }
        }

        const respuesta = await calendar.events.insert({
            calendarId: "primary",
            requestBody: evento
        })

        res.status(201).json({
            mensaje: "Reserva creada en Google Calendar",
            eventoId: respuesta.data.id,
            enlace: respuesta.data.htmlLink
        })

    } catch (error) {

        console.error("Error al crear el evento:", error)

        res.status(500).json({
            mensaje: "No se pudo crear el evento en Google Calendar"
        })
    }
})
