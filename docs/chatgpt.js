$(document).on('submit', '#addEntry_donar', function(e) {
  e.preventDefault();
  guestbook.add(
    $('#name_donar').val().trim(),
    $('#description_donar').val().trim()
  ).done(function(result) {
    // Mostrar el mensaje de confirmación
    showConfirmation();
    // Recargar la página después de 5 segundos
    setTimeout(function() {
      window.location.reload();
    }, 5000);
  }).error(function(error) {
    console.log(error);
  });
});

// Función para mostrar el mensaje de confirmación
function showConfirmation() {
  const message = document.getElementById('confirmMessage');
  message.style.display = 'block'; // Muestra el mensaje
  setTimeout(function() {
    message.style.display = 'none'; // Oculta el mensaje después de 5 segundos
  }, 5000);
}
