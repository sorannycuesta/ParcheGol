console.log("calendar.js está conectado")
const formulario = document.getElementById("formReserva")
const nombre = document.getElementById("nombre")
//nombre.value usar ahora pa tener el nombre como tal
const correo = document.getElementById("correo")
const cancha = document.getElementById("cancha")
const fechaReserva = document.getElementById("fecha")
const hInicio = document.getElementById("horaInicio")
const hFinal = document.getElementById("horaFin")
const observaciones = document.getElementById("observaciones")


formulario.addEventListener("submit", async function (evento) {
    evento.preventDefault()
    console.log("Se ejecutó el evento submit")
    //console.log("Formulario enviado")
    let nombreCliente = nombre.value
    let correoCliente = correo.value
    let canchaCliente = cancha.value
    let fechaCliente = fechaReserva.value
    let hInicioCliente = hInicio.value
    let hFinalCliente = hFinal.value
    let observacionesCliente = observaciones.value

    let reserva = {
        nombreCliente: nombreCliente,
        correoCliente: correoCliente,
        canchaCliente: canchaCliente,
        fechaCliente: fechaCliente,
        hInicioCliente: hInicioCliente,
        hFinalCliente: hFinalCliente,
        observacionesCliente: observacionesCliente
    }
    console.log(reserva)

    //para guardar momentanemente solo una reserva para la prueba
    let reservaJSON = JSON.stringify(reserva)
    localStorage.setItem("reserva", reservaJSON)
    let reservaGuardada = localStorage.getItem("reserva")
    let reservaObjeto = JSON.parse(reservaGuardada)
    console.log(reservaObjeto)

    /////// consumir API////

    try {

        const respuesta = await fetch("http://localhost:3000/crear-evento", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(reservaObjeto)
        })

        const resultado = await respuesta.json()
        if (!respuesta.ok) {
            throw new Error(resultado.mensaje)
        }
        console.log("Reserva creada:", resultado)
        console.log("Enlace del evento:", resultado.enlace)
    } catch (error) {
        console.error("Error al enviar la reserva:", error)
    }

});


