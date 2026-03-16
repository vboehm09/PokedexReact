
function normalizeTypeName (typeName) {
    return typeName
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z/ ]/g, "")
        .toLowerCase()
}

function Card (props) {
    const types = props.tipo.split("/")
    const primaryType = normalizeTypeName(types[0])

    return (
        <>
            <article className="pokemon-card" data-type={primaryType}>
                <span className="pokemon-number">#{String(props.numero).padStart(4, "0")}</span>
                <div className="pokemon-image-wrap">
                    <img className="pokemon-image" src={props.imagem} alt={props.nome} />
                </div>
                <h2 className="pokemon-name">{props.nome}</h2>
                <div className="pokemon-types">
                    {types.map((type) => (
                        <span key={`${props.nome}-${type}`} className={`pokemon-type pokemon-type--${normalizeTypeName(type)}`}>
                            {type}
                        </span>
                    ))}
                </div>
            </article>
            
        </>
    )
}

export default Card
