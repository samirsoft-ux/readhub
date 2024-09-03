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
    add(name, description) {
      console.log('Sending', name, description);
      return $.ajax({
        type: 'POST',
        url: `${apiUrl}/guestbook/entries`,
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify({
          name,
          description,
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
        nameSelect.empty();
        nameSelect.append('<option value="">Selecciona un nombre</option>');
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
    // reload entries on success
    $(document).on('submit', '#addEntry_reserva', function(e) {
      e.preventDefault();
  
      guestbook.add(
        $('#name_reserva').val().trim(),
        $('#description_reserva').val().trim()
      ).done(function(result) {
        // reload entries
        loadEntries();
      }).error(function(error) {
        console.log(error);
      });
    });
  
    $(document).ready(function() {
      prepareTemplates();
      loadEntries();
    });
  })();
  