import { useEffect, useState } from "react"
import "./App.css"
import Card from "./components/Card"

const TOTAL_POKEMON = 1025
const API_BASE_URL = import.meta.env.DEV ? "" : "http://localhost:3001"

function App () {
  const [pokemons, setPokemons] = useState([])
  const [types, setTypes] = useState([])
  const [selectedType, setSelectedType] = useState("all")
  const [status, setStatus] = useState("loading")
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true

    async function loadTypes () {
      try {
        const response = await fetch(`${API_BASE_URL}/api/types`)

        if (!response.ok) {
          throw new Error("Nao foi possivel carregar os tipos de Pokemon.")
        }

        const data = await response.json()

        if (active) {
          setTypes(data)
        }
      } catch (_loadError) {
        if (active) {
          setTypes([{ value: "all", label: "Todos" }])
        }
      }
    }

    loadTypes()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true

    async function loadPokemons () {
      try {
        setStatus("loading")
        setError("")

        const response = await fetch(`${API_BASE_URL}/api/pokemons?type=${selectedType}`)

        if (!response.ok) {
          throw new Error("Nao foi possivel carregar a lista de Pokemon.")
        }

        const data = await response.json()

        if (active) {
          setPokemons(data.pokemons ?? [])
          setStatus("success")
        }
      } catch (loadError) {
        if (active) {
          setError(`${loadError.message} Verifique se o backend esta rodando na porta 3001.`)
          setStatus("error")
        }
      }
    }

    loadPokemons()

    return () => {
      active = false
    }
  }, [selectedType])

  return (
    <main className="app-shell">
      <header className="app-header">
        <p className="eyebrow">Pokedex completa</p>
        <h1>Todos os Pokemon existentes</h1>
        <p className="app-description">
          Backend proprio para pesquisar Pokemon por tipo e listar a Pokedex nacional completa.
        </p>
        <div className="filter-panel">
          <label className="filter-label" htmlFor="pokemon-type-filter">Filtrar por tipo</label>
          <select
            id="pokemon-type-filter"
            className="filter-select"
            value={selectedType}
            onChange={(event) => setSelectedType(event.target.value)}
          >
            {types.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
        <p className="app-status">
          {status === "loading" && `Consultando o backend...`}
          {status === "success" && `${pokemons.length} Pokemon exibidos de ${TOTAL_POKEMON}.`}
          {status === "error" && error}
        </p>
      </header>

      <section className="pokedex">
        {pokemons.map((pokemon) => (
          <Card
            key={pokemon.id}
            numero={pokemon.id}
            nome={pokemon.nome}
            tipo={pokemon.tipo}
            tipoChave={pokemon.tipoChave}
            imagem={pokemon.imagem}
          />
        ))}
      </section>
    </main>
  )
}

export default App
