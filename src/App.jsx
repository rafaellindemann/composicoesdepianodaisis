import { useEffect, useState } from "react";
import "./App.css";

const NOTAS = [
  { nome: "Dó", freq: 261.63, tecla: "A" },
  { nome: "Ré", freq: 293.66, tecla: "S" },
  { nome: "Mi", freq: 329.63, tecla: "D" },
  { nome: "Fá", freq: 349.23, tecla: "F" },
  { nome: "Sol", freq: 392.0, tecla: "G" },
  { nome: "Lá", freq: 440.0, tecla: "H" },
  { nome: "Si", freq: 493.88, tecla: "J" },
  { nome: "Dó+", freq: 523.25, tecla: "K" },
];

function tocarNota(freq) {
  const audio = new AudioContext();
  const oscilador = audio.createOscillator();
  const volume = audio.createGain();

  oscilador.type = "sine";
  oscilador.frequency.value = freq;

  oscilador.connect(volume);
  volume.connect(audio.destination);

  volume.gain.setValueAtTime(0.25, audio.currentTime);
  volume.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.45);

  oscilador.start();
  oscilador.stop(audio.currentTime + 0.45);
}

function App() {
  const [melodia, setMelodia] = useState([]);
  const [nome, setNome] = useState("");
  const [salvas, setSalvas] = useState([]);
  const [melodiaAberta, setMelodiaAberta] = useState(null);
  const [tocando, setTocando] = useState(false);
  const [notaAtual, setNotaAtual] = useState(null);

  useEffect(() => {
    const melodiasSalvas = JSON.parse(localStorage.getItem("melodias")) || [];
    setSalvas(melodiasSalvas);
  }, []);

  function adicionarNota(nota) {
    tocarNota(nota.freq);
    setMelodia([...melodia, nota]);
  }

  function removerUltimaNota() {
    setMelodia(melodia.slice(0, -1));
  }

  function limparMelodia() {
    setMelodia([]);
  }

  function salvarMelodia() {
    if (nome.trim() === "" || melodia.length === 0) {
      alert("Dê um nome e coloque pelo menos uma nota na melodia!");
      return;
    }

    const novaMelodia = {
      id: Date.now(),
      nome,
      notas: melodia,
    };

    const novasSalvas = [...salvas, novaMelodia];

    localStorage.setItem("melodias", JSON.stringify(novasSalvas));
    setSalvas(novasSalvas);
    setNome("");
    setMelodia([]);
  }

  function abrirMelodia(musica) {
    setMelodiaAberta(musica);
    setNotaAtual(null);
  }

  function excluirMelodia(id) {
    const novasSalvas = salvas.filter((musica) => musica.id !== id);

    localStorage.setItem("melodias", JSON.stringify(novasSalvas));
    setSalvas(novasSalvas);

    if (melodiaAberta && melodiaAberta.id === id) {
      setMelodiaAberta(null);
    }
  }

  async function tocarMelodia(notas) {
    if (tocando) return;

    setTocando(true);

    for (let i = 0; i < notas.length; i++) {
      setNotaAtual(i);
      tocarNota(notas[i].freq);

      await new Promise((resolve) => setTimeout(resolve, 550));
    }

    setNotaAtual(null);
    setTocando(false);
  }

  return (
    <main className="app">
      <section className="card hero">
        <h1>Compositor de Melodias</h1>
        <p>
          Escolha as notas, monte sua música e salve para tocar depois no
          teclado.
        </p>
      </section>

      <section className="card">
        <h2>Compor nova melodia</h2>

        <div className="notas">
          {NOTAS.map((nota) => (
            <button
              key={nota.nome}
              className="nota"
              onClick={() => adicionarNota(nota)}
            >
              <strong>{nota.nome}</strong>
              <span>tecla {nota.tecla}</span>
            </button>
          ))}
        </div>

        <div className="partitura">
          {melodia.length === 0 ? (
            <p className="vazio">Sua melodia aparecerá aqui...</p>
          ) : (
            melodia.map((nota, index) => (
              <span key={index} className="bolinha-nota">
                {nota.nome}
              </span>
            ))
          )}
        </div>

        <div className="acoes">
          <button onClick={() => tocarMelodia(melodia)}>Tocar melodia</button>
          <button onClick={removerUltimaNota}>Apagar última</button>
          <button onClick={limparMelodia}>Limpar</button>
        </div>

        <div className="salvar">
          <input
            type="text"
            placeholder="Nome da melodia"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />

          <button onClick={salvarMelodia}>Salvar</button>
        </div>
      </section>

      <section className="card">
        <h2>Melodias salvas</h2>

        {salvas.length === 0 ? (
          <p className="vazio">Nenhuma melodia salva ainda.</p>
        ) : (
          <div className="lista-salvas">
            {salvas.map((musica) => (
              <article key={musica.id} className="musica-salva">
                <div>
                  <h3>{musica.nome}</h3>
                  <p>{musica.notas.length} notas</p>
                </div>

                <div className="acoes-musica">
                  <button onClick={() => abrirMelodia(musica)}>Ver</button>
                  <button onClick={() => tocarMelodia(musica.notas)}>
                    Tocar
                  </button>
                  <button onClick={() => excluirMelodia(musica.id)}>
                    Excluir
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {melodiaAberta && (
        <section className="card modo-tocar">
          <h2>{melodiaAberta.nome}</h2>
          <p>Use esta sequência para tocar no teclado:</p>

          <div className="partitura grande">
            {melodiaAberta.notas.map((nota, index) => (
              <span
                key={index}
                className={
                  notaAtual === index
                    ? "bolinha-nota nota-destaque"
                    : "bolinha-nota"
                }
              >
                {nota.nome}
              </span>
            ))}
          </div>

          <button onClick={() => tocarMelodia(melodiaAberta.notas)}>
            Tocar composição
          </button>
        </section>
      )}
    </main>
  );
}

export default App;