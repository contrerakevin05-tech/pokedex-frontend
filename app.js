document.addEventListener('DOMContentLoaded', () => {

    console.log("✅ App corriendo");

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

    let currentPokemon = null;

    // ===== APIs =====
    const API_MONGO = "https://pokemon2-qq1z.onrender.com";
    const API_MYSQL = "https://pokemon-89gd.onrender.com";

    // ===== FETCH =====
    async function fetchPokemon(name, useMongo = true) {

        name = name.trim().toLowerCase();

        if (!name) {

            showError("Escribe un nombre");

            return;
        }

        const baseURL = useMongo
            ? API_MONGO
            : API_MYSQL;

        const endpoint = useMongo
            ? `/api/pokemon/${name}`
            : `/pokemon/${name}`;

        const url = `${baseURL}${endpoint}`;

        try {

            console.log("🔍 Consultando:", url);

            const controller = new AbortController();

            const timeout = setTimeout(() => {
                controller.abort();
            }, 15000);

            const response = await fetch(url, {
                signal: controller.signal
            });

            clearTimeout(timeout);

            if (!response.ok) {

                const errorText = await response.text();

                throw new Error(
                    errorText || `Error ${response.status}`
                );
            }

            const data = await response.json();

            console.log("✅ DATA:", data);

            // ===== NORMALIZAR =====
            const pokemon = normalizePokemon(data);

            currentPokemon = pokemon;

            // ===== ALTURA Y PESO =====
            alturaVal.textContent = pokemon.height ?? "-";
            pesoVal.textContent = pokemon.weight ?? "-";

            // ===== HABILIDADES =====
            habilidadesList.innerHTML = "";

            if (pokemon.abilities.length > 0) {

                pokemon.abilities.forEach(ability => {

                    const li = document.createElement('li');

                    li.textContent = ability;

                    habilidadesList.appendChild(li);
                });

            } else {

                const li = document.createElement('li');

                li.textContent = "Sin habilidades";

                habilidadesList.appendChild(li);
            }

            resultSection.classList.remove('hidden');

            errorMessage.classList.add('hidden');

            console.log(
                `📦 Fuente: ${useMongo ? 'MongoDB' : 'MySQL'}`
            );

        } catch (err) {

            console.error("❌ ERROR:", err);

            resultSection.classList.add('hidden');

            if (err.name === 'AbortError') {

                showError(
                    "El servidor tardó demasiado (Render dormido)"
                );

                return;
            }

            const dbName = useMongo
                ? 'MongoDB'
                : 'MySQL';

            showError(
                `Este pokemon no existe en ${dbName}`
            );
        }
    }

    // ===== NORMALIZAR DATOS =====
    function normalizePokemon(data) {

        // ===== MYSQL =====
        if (data.nombre && data.imagenes) {

            return {

                name: data.nombre,

                height: data.altura,

                weight: data.peso,

                abilities: Array.isArray(data.habilidades)
                    ? data.habilidades
                    : [],

                images: {
                    front: data.imagenes?.frontal || "",
                    back: data.imagenes?.trasera || ""
                }
            };
        }

        // ===== MONGO =====
        return {

            name: data.nombre || data.name || "Desconocido",

            height: data.altura || data.height || "-",

            weight: data.peso || data.weight || "-",

            abilities: Array.isArray(
                data.habilidades || data.abilities
            )
                ? (data.habilidades || data.abilities)
                : [],

            images: {
                front:
                    data.imagenes?.frontal ||
                    data.images?.front ||
                    "",

                back:
                    data.imagenes?.trasera ||
                    data.images?.back ||
                    ""
            }
        };
    }

    // ===== ERROR =====
    function showError(msg) {

        errorMessage.textContent = msg;

        errorMessage.classList.remove('hidden');
    }

    // ===== BOTONES =====
    btnMongo.onclick = () => {

        fetchPokemon(input.value, true);
    };

    btnMysql.onclick = () => {

        fetchPokemon(input.value, false);
    };

    // ===== ENTER =====
    input.addEventListener('keypress', (e) => {

        if (e.key === 'Enter') {

            fetchPokemon(input.value, true);
        }
    });

    // ===== MODAL =====
    btnVerImagenes.onclick = () => {

        if (!currentPokemon) return;

        modalPokemonName.textContent =
            currentPokemon.name;

        spriteFront.src =
            currentPokemon.images.front || "";

        spriteBack.src =
            currentPokemon.images.back || "";

        modal.classList.remove('hidden');
    };

    // ===== CERRAR MODAL =====
    closeBtn.onclick = () => {

        modal.classList.add('hidden');
    };

});