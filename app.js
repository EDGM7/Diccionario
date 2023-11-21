document.addEventListener('DOMContentLoaded', function () {

    const instructionsSection = document.getElementById('instructions');
    const searchContainer = document.getElementById('search');
    const toolsSection = document.getElementById('tools');
  
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const resultsContainer = document.getElementById('resultsContainer');
    const themeToggle = document.getElementById('themeToggle');
    const fontSelect = document.getElementById('fontSelect');
    const clearButton = document.getElementById('clearButton');


    // Mostrar instrucciones por defecto
    instructionsSection.style.display = 'block';
    searchContainer.style.display = 'none';
    toolsSection.style.display = 'none';

    // Eventos para cambiar la visibilidad del contenido
    document.getElementById('menu').addEventListener('click', function (event) {
        event.preventDefault();

        const targetId = event.target.getAttribute('href').substring(1);
        hideAllSections();
        document.getElementById(targetId).style.display = 'block';
    });

    function hideAllSections() {
        instructionsSection.style.display = 'none';
        searchContainer.style.display = 'none';
        toolsSection.style.display = 'none';
    }

    themeToggle.addEventListener('change', toggleTheme);
    fontSelect.addEventListener('change', changeFont);

    // ...

    function toggleTheme() {
        document.body.classList.toggle('dark-theme');
        resultsContainer.classList.toggle('dark-theme');
    }

    function changeFont() {
        const selectedFont = fontSelect.value;
        document.body.style.fontFamily = selectedFont;
        resultsContainer.style.fontFamily = selectedFont;
    }


    searchButton.addEventListener('click', debounce(search, 500));
      
    // Agrega un evento al botón de limpiar
    clearButton.addEventListener('click', clearSearch);
    
    function clearSearch() {
        // Limpiar el contenido del cuadro de búsqueda y los resultados
        searchInput.value = '';
        resultsContainer.innerHTML = '';
    }


function search() {
    const searchTerm = searchInput.value.trim();

    if (searchTerm !== '') {
        // Limpiar resultados anteriores
        resultsContainer.innerHTML = '';

        // Realizar la solicitud a la API
        fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${searchTerm}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`No se encontraron definiciones para la palabra "${searchTerm}".`);
                }
                return response.json();
            })
            .then(data => {
                // Verificar si la respuesta tiene el formato esperado
                if (Array.isArray(data) && data.length > 0) {
                    // Mostrar los resultados en el DOM
                    displayResults(data[0]); // Pasa la primera entrada como argumento
                } else {
                    throw new Error('La respuesta de la API no tiene el formato esperado.');
                }
            })
            .catch(error => {
                console.error('Error al realizar la solicitud a la API:', error);
                resultsContainer.innerHTML = `<p>${error.message}</p>`;
            });
    }
}


function displayResults(entry) {
    // Obtener los enlaces de las fuentes
    const sourceLinks = entry.sourceUrls.map(url => `<a href="${url}" target="_blank">${url}</a>`).join(', ');

    // Obtener sinónimos si están disponibles
    const synonyms = entry.meanings[0]?.definitions[0]?.synonyms || [];

    // Mostrar la información en el DOM
    const meanings = entry.meanings.map(meaning => `
        <div class="meaning">
            <h3>${meaning.partOfSpeech}</h3>
            <p>${meaning.definitions[0].definition}</p>
        </div>
    `).join('');

    const pronunciation = entry.phonetics[0]?.audio || '';
    const pronunciationText = entry.phonetics[0]?.text || '';

    // Verificar si hay una pronunciación disponible
    const pronunciationSection = pronunciation
        ? `
            <div class="pronunciation">
                <p>Pronunciación:</p>
                <p>${pronunciationText}</p>
                <audio controls>
                    <source src="${pronunciation}" type="audio/mpeg">
                    Tu navegador no soporta el elemento de audio.
                </audio>
            </div>
          `
        : '<p>No hay pronunciación disponible para esta palabra.</p>';

    // Agregar el significado de la palabra
    const wordDefinition = entry.meanings[0]?.definitions[0]?.definition || '<p>No hay definición disponible para esta palabra.</p>';

    const synonymsSection = synonyms.length
        ? `<div class="synonyms">
               <p>Sinónimos: ${synonyms.join(', ')}</p>
           </div>`
        : '';

    resultsContainer.innerHTML = `
        <h2>${entry.word}</h2>
        ${pronunciationSection}
        <div class="word-definition">
            <p>Significado:</p>
            ${wordDefinition}
        </div>
        ${meanings}
        ${synonymsSection}
        <div class="sources">
            <p>Información proporcionada por: </p>
            ${sourceLinks}
        </div>
    `;
}

    function debounce(func, delay) {
        let timeout;
        return function () {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(function () {
                func.apply(context, args);
            }, delay);
        };
    }
});


