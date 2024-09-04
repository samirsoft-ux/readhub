/**
 * Web application
 */
const apiUrl = 'https://test-guestbook.1kjitwcji3ey.us-south.codeengine.appdomain.cloud';

// for local testing
//const apiUrl = 'http://localhost:8080';
const guestbook = {
  // retrieve the existing guestbook entries
  get() {
    return $.ajax({
      type: 'GET',
      url: `${apiUrl}/guestbook/entries`,
      dataType: 'json'
    });
  },
  // add a single guestbook entry
  add(name, description, category, image, status) {
    console.log('Sending', name, description, category, image, status);
    return $.ajax({
      type: 'POST',
      url: `${apiUrl}/guestbook/entries`,
      contentType: 'application/json; charset=utf-8',
      data: JSON.stringify({
        name,
        description,
        category  // Incluir la categoría en la petición
      }),
      dataType: 'json',
    });
  }
};

(function() {

  let entriesTemplate;

  function prepareTemplates() {
    entriesTemplate = Handlebars.compile($('#entries-template').html());
  }

  // retrieve entries and update the UI
  function loadEntries() {
    console.log('Loading entries...');
    $('#entries').html('Loading entries...');
    guestbook.get().done(function(result) {
      // Añadir un console.log para verificar el resultado
      console.log('Entries from API:', result.entries);
      
      if (!result.entries) {
        return;
      }
      // Ordena las entradas por fecha
      result.entries.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      // Renderiza las entradas en la página
      const context = {
        entries: result.entries
      }
      $('#entries').html(entriesTemplate(context));

      // Llena la lista desplegable con los nombres
      const nameSelect = $('#lista_libro');
      nameSelect.empty(); // Limpia cualquier opción existente
      nameSelect.append('<option value="">Selecciona un nombre</option>'); // Opción por defecto
      // Asegúrate de que estás añadiendo los nombres correctamente
      result.entries.forEach(entry => {
        if (entry.name) {
          nameSelect.append(`<option value="${entry.name}">${entry.name}</option>`);
        }
      });
    }).error(function(error) {
      $('#entries').html('No entries');
      console.log(error);
    });
  }

  // intercept the click on the submit button, add the guestbook entry and
  // intercept the click on the submit button, add the guestbook entry and reload entries on success
  $(document).on('submit', '#addEntry_donar', function(e) {
    e.preventDefault();
    guestbook.add(
      $('#name_donar').val().trim(),
      $('#description_donar').val().trim(),
      $('#category_donar').val().trim(),  // Asegúrate de tener un input para la categoría
    ).done(function(result) {
      // Establecer una bandera en el almacenamiento local
      localStorage.setItem('showConfirmation', 'true');
      // Recargar la página
      window.location.reload();
    }).error(function(error) {
      console.log(error);
    });
  });

  $(document).ready(function() {
    prepareTemplates();
    loadEntries();
  
    // Comprobar si se debe mostrar el mensaje de confirmación
    if (localStorage.getItem('showConfirmation') === 'true') {
      showConfirmation();
      // Limpiar la variable para que el mensaje no se muestre de nuevo sin una nueva operación
      localStorage.removeItem('showConfirmation');
    }
  });
  
  // Función para mostrar el mensaje de confirmación
  function showConfirmation() {
    const message = document.getElementById('confirmMessage');
    message.style.display = 'block'; // Muestra el mensaje
    setTimeout(function() {
      message.style.display = 'none'; // Oculta el mensaje después de 5 segundos
    }, 5000);
  }
})();
