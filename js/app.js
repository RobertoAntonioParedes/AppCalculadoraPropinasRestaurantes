let cliente = {
    mesa: '',
    hora: '',
    pedido: [],
};

const categorias ={
    1: 'Comida',
    2: 'Bebidas',
    3: 'Postres'
};

const crearOrden = document.querySelector('#guardar-cliente');


crearOrden.addEventListener('click', ordenCreada);

function ordenCreada(e){
    e.preventDefault();
    const mesa = document.querySelector('#mesa').value;
    const hora = document.querySelector('#hora').value;

    //Revisar si hay campos vacios

    const camposVacios = [mesa, hora].some(campos=> campos === '');

    if(camposVacios){
        //Validar si hay una alerta
        const avisoAlerta = document.querySelector('.invalid-feedback');

        if(!avisoAlerta){
            const alerta = document.createElement('DIV');
            alerta.classList.add('invalid-feedback', 'text-center', 'd-block');
            alerta.textContent = 'Todos los campos son obligatorios'

            document.querySelector('.modal-body form').appendChild(alerta);
    
            setTimeout(()=>{
                alerta.remove();
            }, 3500);
        };
        return;
      
    }else{
        console.log('Todos los campos estan correctos');
    }

    //Asignar datos del formulario al cliente
    cliente = {...cliente, mesa, hora};

    //Ocultar modal
    const modalFormulario = document.querySelector('#formulario');
    const modalBootstrap = bootstrap.Modal.getInstance(modalFormulario);

    modalBootstrap.hide();

    //Mostrar las secciones
    mostrarSecciones();
    
    //Obtener platillos de la API
    obtenerPlatillos();

};

function mostrarSecciones(){
    const seccionesOcultas = document.querySelectorAll('.d-none');   
    seccionesOcultas.forEach(seccion=>{seccion.classList.remove('d-none');
    });
};

function obtenerPlatillos(){
    const url = 'http://localhost:4000/platillos';
    fetch(url)
        .then(respuesta => respuesta.json())
        .then(resultado => mostrarPlatillos(resultado));
};

function mostrarPlatillos(platillos){
    const contenido = document.querySelector('#platillos .contenido');
    platillos.forEach(platillo=>{
        const {id, nombre, precio, categoria} = platillo;
        const row = document.createElement('DIV');
        row.classList.add('row', 'py-3', 'border-top');
        const nombrePlatillo = document.createElement('P');
        nombrePlatillo.classList.add('col-md-4');
        nombrePlatillo.textContent = nombre;

        const precioPlatillo = document.createElement('DIV');
        precioPlatillo.classList.add('col-md-3', 'fw-bold');
        precioPlatillo.textContent = `$ ${precio}`;

        const categoriaPlatillo = document.createElement('DIV');
        categoriaPlatillo.classList.add('col-md-3');
        categoriaPlatillo.textContent = categorias[categoria];

        const inputCantidad = document.createElement('INPUT');
        inputCantidad.type = 'number';
        inputCantidad.classList.add('form-control');
        inputCantidad.min = 0;
        inputCantidad.id = `producto-${id}`;

        //Funcion que detecta la cantidady el platillo que se esta agregando
        inputCantidad.onchange = function (){
            const cantidad = parseInt(inputCantidad.value);
            agregarPlatillo({...platillo, cantidad});
        };
        const agregar = document.createElement('DIV');
        agregar.classList.add('col-md-2');

        row.appendChild(nombrePlatillo);
        row.appendChild(precioPlatillo);
        row.appendChild(categoriaPlatillo);
        agregar.appendChild(inputCantidad);
        row.appendChild(agregar);

        contenido.appendChild(row);
    });
};

function agregarPlatillo(producto){
    let {pedido} = cliente;
    //Revisar que la cantidad sea mayor a 0
    if(producto.cantidad > 0){
        //Comprueba si el elemento ya existe en el array
        if(pedido.some(articulo => articulo.id === producto.id)){
            //Actualizar el producto existente
            const pedidoActualizado = pedido.map(articulo =>{
                if(articulo.id === producto.id){
                    articulo.cantidad = producto.cantidad; 
                };
                return articulo;
            });
        //Se asigna el nuevo array a cliente.pedido
        cliente.pedido = [...pedidoActualizado];
        }else{
            cliente.pedido = [...pedido, producto];
        };
    }else{
        //Eliminar elementos cuando la cantidad sea 0
        const resultado = pedido.filter(articulo=> articulo.id !== producto.id);
        cliente.pedido = [...resultado];
    };
    //Limpiar el Html
    limpiarHtml();
 
    if(cliente.pedido.length){
        //Mostrar el resumen
        mostrarResumen();
     }
     else{
        mensajePedido();
     };

};

function mostrarResumen(){
    
    contenido = document.querySelector('#resumen .contenido');

    const resumen = document.createElement('DIV');
    resumen.classList.add('col-md-6', 'card', 'py-2', 'px-3', 'shadow');
    
    //Titulo de la seccion
    const heading = document.createElement('H3');
    heading.classList.add('my-4', 'text-center');
    heading.textContent = 'Platillos solicitados';

    //Información de la mesa
    const mesa = document.createElement('P');
    mesa.textContent = 'Mesa: '
    mesa.classList.add('fw-bold');

    const mesaSpan = document.createElement('SPAN');
    mesaSpan.textContent = cliente.mesa;
    mesaSpan.classList.add('fw-normal');

    //Información de la hora
    const hora = document.createElement('P');
    hora.textContent = 'Hora: '
    hora.classList.add('fw-bold');

    const horaSpan = document.createElement('SPAN');
    horaSpan.textContent = cliente.hora;
    horaSpan.classList.add('fw-normal');

    //Crear lista
    const lista = document.createElement('UL');
    lista.classList.add('list-group');

    //Iterar sobre el array de pedidos 
    const {pedido} = cliente;
    pedido.forEach(articulo =>{
        const {cantidad, nombre, precio, id} = articulo;

        const li = document.createElement('LI');
        li.classList.add('list-group-item');
        
        const nombreEl = document.createElement('H4');
        nombreEl.classList.add('my-4');
        nombreEl.textContent = `Platillo: ${nombre}`;

        const cantidadEl = document.createElement('P');
        cantidadEl.classList.add('fw-bold');
        cantidadEl.textContent = `Cantidad:  ${cantidad}`;

        const precioEl = document.createElement('P');
        precioEl.classList.add('fw-bold');
        precioEl.textContent = `Valor: $${precio}`;

        //subtotal del articulo
        const subtotalEl = document.createElement('P');
        subtotalEl.classList.add('fw-bold');
        subtotalEl.textContent = 'Subtotal: ';

        const subtotalValor = document.createElement('SPAN');
        subtotalValor.classList.add('fw-normal');
        subtotalValor.textContent = calcularSubtotal(precio, cantidad);

        //Crear boton de eliminar
        const btnEliminar = document.createElement('BUTTON');
        btnEliminar.classList.add('btn', 'btn-danger');
        btnEliminar.textContent = 'Eliminar del pedido';

        //Función para eliminar el pedido
        btnEliminar.onclick = function(){
            eliminarPedido(id);
        };

        subtotalEl.appendChild(subtotalValor);

        li.appendChild(nombreEl);
        li.appendChild(cantidadEl);
        li.appendChild(precioEl);
        li.appendChild(subtotalEl);
        li.appendChild(btnEliminar);

        lista.appendChild(li);
    
    });

    mesa.appendChild(mesaSpan);
    hora.appendChild(horaSpan);

    resumen.appendChild(heading);
    resumen.appendChild(mesa);
    resumen.appendChild(hora);
    resumen.appendChild(lista);

    contenido.appendChild(resumen);

    //Mostrar formulario de propinas
    formularioPropinas();


};

function calcularSubtotal(precio, cantidad){
    return `$ ${precio * cantidad}`;
};

function eliminarPedido(id){
    const {pedido} = cliente;
    const resultado = pedido.filter(articulo=> articulo.id !== id);
    cliente.pedido = [...resultado];

     //Limpiar el Html
     limpiarHtml();

     if(cliente.pedido.length){
        //Mostrar el resumen
        mostrarResumen();
     }
     else{
        mensajePedido();
     };

     //Retornar valores cuando el producto ha sido eliminado
     const eliminarProducto = `#producto-${id}`;
     const productoEliminado = document.querySelector(eliminarProducto);
     productoEliminado.value = 0;
};

function mensajePedido(){
    const contenido = document.querySelector('#resumen .contenido');

    const texto = document.createElement('P');
    texto.classList.add('text-center');
    texto.textContent = 'Añade los elementos al pedido';

    contenido.appendChild(texto);

};

function formularioPropinas(){
    const contenido = document.querySelector('#resumen .contenido');

    const formulario = document.createElement('DIV');
    formulario.classList.add('formulario', 'col-md-6');

    const divFormulario = document.createElement('DIV');
    divFormulario.classList.add('card', 'py-2', 'px-3', 'shadow');

    const heading = document.createElement('H3');
    heading.classList.add('my-4', 'text-center');
    heading.textContent = 'Propina'

    //Radio Button 10%
    const radioBtn10 = document.createElement('INPUT');
    radioBtn10.type = 'radio';
    radioBtn10.name = 'propina';
    radioBtn10.value = '10';
    radioBtn10.classList.add('form-check-input');

    radioBtn10.onclick = agregarPropina;

    const radioBtn10Label = document.createElement('LABEL');
    radioBtn10Label.textContent = '10%';
    radioBtn10Label.classList.add('form-check-label');

    const radioBtn10Div = document.createElement('DIV');
    radioBtn10Div.classList.add('form-check');

    radioBtn10Div.appendChild(radioBtn10);
    radioBtn10Div.appendChild(radioBtn10Label);

    const radioBtn25 = document.createElement('INPUT');
    radioBtn25.type = 'radio';
    radioBtn25.name = 'propina';
    radioBtn25.value = '25'; 
    radioBtn25.classList.add('form-check-input');
    
    radioBtn25.onclick = agregarPropina;

    const radioBtn25Label = document.createElement('LABEL');
    radioBtn25Label.textContent = '25%';
    radioBtn25Label.classList.add('form-check-label');

    const radioBtn25Div = document.createElement('DIV');
    radioBtn25Div.classList.add('form-check');

    radioBtn25Div.appendChild(radioBtn25);
    radioBtn25Div.appendChild(radioBtn25Label);

    
    const radioBtn50 = document.createElement('INPUT');
    radioBtn50.type = 'radio';
    radioBtn50.name = 'propina';
    radioBtn50.value = '50';
    radioBtn50.classList.add('form-check-input');

    radioBtn50.onclick = agregarPropina;

    const radioBtn50Label = document.createElement('LABEL');
    radioBtn50Label.textContent = '50%';
    radioBtn50Label.classList.add('form-check-label');

    const radioBtn50Div = document.createElement('DIV');
    radioBtn50Div.classList.add('form-check');

    radioBtn50Div.appendChild(radioBtn50);
    radioBtn50Div.appendChild(radioBtn50Label);

    divFormulario.appendChild(heading);
    divFormulario.appendChild(radioBtn10Div);
    divFormulario.appendChild(radioBtn25Div);
    divFormulario.appendChild(radioBtn50Div);
    formulario.appendChild(divFormulario);
    contenido.appendChild(formulario);
};

function agregarPropina(){
    const {pedido} = cliente;
    let subtotal = 0;

    //Calcular el subtotal a pagar
    pedido.forEach(articulo =>{
        subtotal += articulo.cantidad * articulo.precio;
    });

    //Seleccionar el radio Button
    const propinaSeleccionada = document.querySelector('[name="propina"]:checked').value;

    //Calcular la propina
    const propina = ((subtotal * parseInt(propinaSeleccionada))/100);

    //Calcular el total a pagar
    const total =  subtotal + propina;

    mostrarTotalHtml(subtotal, total, propina);
};

function mostrarTotalHtml(subtotal, total, propina){
    //Subtotal
    const totalDiv = document.createElement('DIV');
    totalDiv.classList.add('total-pagar');

    const subtotalParrafo = document.createElement('P');
    subtotalParrafo.classList.add('fs-3', 'fw-bold', 'mt-4');
    subtotalParrafo.textContent = `Subtotal de consumo: `;

    const subtotalSpan = document.createElement('SPAN');
    subtotalSpan.classList.add('fw-normal');
    subtotalSpan.textContent = `$${subtotal}`;

    const totalParrafo = document.createElement('P');
    totalParrafo.classList.add('fs-3', 'fw-bold', 'mt-4');
    totalParrafo.textContent = `Total de consumo: `;

    const totalSpan = document.createElement('SPAN');
    totalSpan.classList.add('fw-normal');
    totalSpan.textContent = `$${total}`;

    const propinaParrafo = document.createElement('P');
    propinaParrafo.classList.add('fs-3', 'fw-bold', 'mt-4');
    propinaParrafo.textContent = `Propina por el servicio: `;

    const propinaSpan = document.createElement('SPAN');
    propinaSpan.classList.add('fw-normal');
    propinaSpan.textContent = `$${propina}`;

    subtotalParrafo.appendChild(subtotalSpan);
    totalParrafo.appendChild(totalSpan);
    propinaParrafo.appendChild(propinaSpan);

    //Eliminar el ultimo resultado
    const totalPagarDiv = document.querySelector('.total-pagar');
    if(totalPagarDiv){
        totalPagarDiv.remove();
    }

    totalDiv.appendChild(subtotalParrafo);
    totalDiv.appendChild(totalParrafo);
    totalDiv.appendChild(propinaParrafo);

    const formulario = document.querySelector('.formulario > div');
    formulario.appendChild(totalDiv);
};

function limpiarHtml(){
    const contenido = document.querySelector('#resumen .contenido');
    while(contenido.firstChild){
        contenido.removeChild(contenido.firstChild);
    }
};


 