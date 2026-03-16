import cors from "cors"
import express from "express"

const app = express()
const PORT = 3001
const TOTAL_POKEMON = 1025
const CHUNK_SIZE = 40

const typeLabelMap = {
  bug: "Inseto",
  dark: "Sombrio",
  dragon: "Dragão",
  electric: "Elétrico",
  fairy: "Fada",
  fighting: "Lutador",
  fire: "Fogo",
  flying: "Voador",
  ghost: "Fantasma",
  grass: "Planta",
  ground: "Terra",
  ice: "Gelo",
  normal: "Normal",
  poison: "Veneno",
  psychic: "Psíquico",
  rock: "Pedra",
  steel: "Aço",
  water: "Água",
}

let pokemonCache = null
let cachePromise = null

app.use(cors())

function formatPokemonName(name) {
  return name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

async function fetchJson(url) {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Falha ao buscar ${url}`)
  }

  return response.json()
}

async function buildPokemonCache() {
  const listData = await fetchJson(`https://pokeapi.co/api/v2/pokemon?limit=${TOTAL_POKEMON}`)
  const results = listData.results ?? []
  const loadedPokemons = []

  for (let index = 0; index < results.length; index += CHUNK_SIZE) {
    const batch = results.slice(index, index + CHUNK_SIZE)
    const detailedBatch = await Promise.all(
      batch.map(async (pokemon) => {
        const details = await fetchJson(pokemon.url)
        const rawTypes = details.types
          .sort((firstType, secondType) => firstType.slot - secondType.slot)
          .map((item) => item.type.name)

        return {
          id: details.id,
          nome: formatPokemonName(details.name),
          tipo: rawTypes.map((type) => typeLabelMap[type] ?? type).join("/"),
          tipoChave: rawTypes.join("/"),
          tipos: rawTypes,
          imagem:
            details.sprites.other?.["official-artwork"]?.front_default ??
            details.sprites.front_default ??
            "",
        }
      }),
    )

    loadedPokemons.push(...detailedBatch)
  }

  loadedPokemons.sort((firstPokemon, secondPokemon) => firstPokemon.id - secondPokemon.id)
  return loadedPokemons
}

async function ensurePokemonCache() {
  if (pokemonCache) {
    return pokemonCache
  }

  if (!cachePromise) {
    cachePromise = buildPokemonCache()
      .then((result) => {
        pokemonCache = result
        return result
      })
      .finally(() => {
        cachePromise = null
      })
  }

  return cachePromise
}

app.get("/api/types", (_request, response) => {
  response.json([
    { value: "all", label: "Todos" },
    ...Object.entries(typeLabelMap).map(([value, label]) => ({ value, label })),
  ])
})

app.get("/api/pokemons", async (request, response) => {
  try {
    const selectedType = String(request.query.type ?? "all").toLowerCase()
    const pokemons = await ensurePokemonCache()

    const filteredPokemons =
      selectedType === "all"
        ? pokemons
        : pokemons.filter((pokemon) => pokemon.tipos.includes(selectedType))

    response.json({
      total: filteredPokemons.length,
      type: selectedType,
      pokemons: filteredPokemons,
    })
  } catch (error) {
    response.status(500).json({
      message: error instanceof Error ? error.message : "Erro interno ao carregar os Pokemon.",
    })
  }
})

app.listen(PORT, () => {
  console.log(`Pokemon API pronta em http://localhost:${PORT}`)
})
