document.addEventListener('DOMContentLoaded', () => {

    console.log("✅ App corriendo");

    // =========================
    // ELEMENTOS DOM
    // =========================

    const input = document.getElementById('pokemon-input');

    const btnMysql = document.getElementById('btn-mysql');
    const btnMongo = document.getElementById('btn-mongo');

    const errorMessage = document.getElementById('error-message');
    const resultSection = document.getElementById('result-section');

    const alturaVal = document.getElementById('altura-val');
    const pesoVal = document.getElementById('peso-val');
    const habilidadesList = document.getElementById('habilidades-list');

    const btnVerImagenes = document.getElementById('ver-imagenes-btn');

    const modal = document.getElementById('image-modal');
    const closeBtn = document.querySelector('.close-btn');

    const spriteFront = document.getElementById('sprite-front');
    const spriteBack = document.getElementById('sprite-back');
    const modalPokemonName = document.getElementById('pokemon-name-modal');

    const loadingSpinner = document.getElementById('loading-spinner');

    let currentPokemon = null;

    // =========================
    // APIs
    // =========================

    const API_MONGO = "https://pokemon2-qq1z.onrender.com";
    const API_MYSQL = "https://pokemon-89gd.onrender.com";

    // =========================
    // FETCH PRINCIPAL
    // =========================

    async function fetchPokemon(name, database) {

        name = name.trim().toLowerCase();

        if (!name) {
            showError("Escribe un nombre de Pokémon");
            return;
        }

        // Reset UI
        errorMessage.classList.add('hidden');
        resultSection.classList.add('hidden');

        loadingSpinner.classList.remove('hidden');

        try {

            let apiBase = "";

            if (database === "mongo") {
                apiBase = API_MONGO;
            } else {
                apiBase = API_MYSQL;
            }

            const data = await requestAPI(apiBase, name);

            currentPokemon = normalize(data);

            render(currentPokemon, database);

            console.log(`📦 Datos obtenidos desde ${database}`);

        } catch (err) {

            console.error("❌ Error:", err);

            showError(`Pokémon no encontrado en ${database.toUpperCase()}`);

        } finally {

            loadingSpinner.classList.add('hidden');

        }
    }

    // =========================
    // REQUEST API
    // =========================

    async function requestAPI(base, name) {

        const url = `${base}/api/pokemon/${name}`;

        console.log("🔍 Consultando:", url);

        const controller = new AbortController();

        const timeout = setTimeout(() => {
            controller.abort();
        }, 15000);

        const res = await fetch(url, {
            signal: controller.signal
        });

        clearTimeout(timeout);

        if (!res.ok) {

            let errorText = "";

            try {
                errorText = await res.text();
            } catch {
                errorText = `Error ${res.status}`;
            }

            throw new Error(errorText);
        }

        return await res.json();
    }

    // =========================
    // NORMALIZAR
    // =========================

    function normalize(data) {

        return {

            name: data.nombre || data.name || "Desconocido",

            height: data.altura ?? data.height ?? "N/A",

            weight: data.peso ?? data.weight ?? "N/A",

            abilities: data.habilidades || data.abilities || [],

            images: {

                front:
                    data.imagen_frontal ||
                    data.imagenes?.frontal ||
                    data.images?.front ||
                    "",

                back:
                    data.imagen_trasera ||
                    data.imagenes?.trasera ||
                    data.images?.back ||
                    ""
            }
        };
    }

    // =========================
    // RENDER
    // =========================

    function render(pokemon, database) {

        alturaVal.textContent = pokemon.height;
        pesoVal.textContent = pokemon.weight;

        habilidadesList.innerHTML = "";

        if (!pokemon.abilities.length) {

            habilidadesList.innerHTML = `
                <li>Sin habilidades</li>
            `;

        } else {

            pokemon.abilities.forEach(ability => {

                const li = document.createElement('li');

                li.textContent = ability;

                habilidadesList.appendChild(li);
            });
        }

        resultSection.classList.remove('hidden');
    }

    // =========================
    // ERROR
    // =========================

    function showError(msg) {

        errorMessage.textContent = msg;

        errorMessage.classList.remove('hidden');
    }

    // =========================
    // BOTONES
    // =========================

    btnMongo.addEventListener('click', () => {

        fetchPokemon(input.value, "mongo");

    });

    btnMysql.addEventListener('click', () => {

        fetchPokemon(input.value, "mysql");

    });

    // ENTER => Mongo por defecto

    input.addEventListener('keypress', (e) => {

        if (e.key === 'Enter') {

            fetchPokemon(input.value, "mongo");
        }
    });

    // =========================
    // MODAL
    // =========================

    btnVerImagenes.addEventListener('click', () => {

        if (!currentPokemon) return;

        modalPokemonName.textContent = currentPokemon.name;

        spriteFront.src = currentPokemon.images.front;
        spriteBack.src = currentPokemon.images.back;

        modal.classList.remove('hidden');
    });

    // Cerrar modal
    closeBtn.addEventListener('click', () => {

        modal.classList.add('hidden');
    });

    // Cerrar clic afuera
    window.addEventListener('click', (e) => {

        if (e.target === modal) {

            modal.classList.add('hidden');
        }
    });

});
