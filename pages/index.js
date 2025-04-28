import Head from 'next/head';
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function ChallengeApp() {
  const [challenges, setChallenges] = useState([]);
  const [newChallengeText, setNewChallengeText] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [newPoints, setNewPoints] = useState(1);
  const [showForm, setShowForm] = useState(false);

  const [step, setStep] = useState("idle");
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedPoints, setSelectedPoints] = useState(null);
  const [codeInput, setCodeInput] = useState("");
  const [currentChallenge, setCurrentChallenge] = useState(null);

  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    const { data, error } = await supabase
      .from("challenges")
      .select("*")
      .order("date", { ascending: true });

    if (error) {
      console.error("Fehler beim Laden:", error.message);
    } else {
      setChallenges(data);
    }
  };

  const submitChallenge = async () => {
    if (!newChallengeText.trim() || !newAuthor.trim()) return;

    const parsedPoints = parseInt(newPoints);
    if (isNaN(parsedPoints) || parsedPoints < 1 || parsedPoints > 5) {
      alert("Punkte müssen zwischen 1 und 5 liegen.");
      return;
    }

    const newChallenge = {
      text: newChallengeText.trim(),
      points: parsedPoints,
      author: newAuthor.trim(),
      date: new Date().toISOString(),
      status: null,
      player: null,
    };

    const { error } = await supabase.from("challenges").insert([newChallenge]);

    if (error) {
      console.error("Fehler beim Speichern der Challenge:", error.message);
      return;
    }

    await fetchChallenges();
    setNewChallengeText("");
    setNewAuthor("");
    setNewPoints(1);
    setShowForm(false);
  };

  const updateChallengeStatus = async (challengeId, status) => {
    const { error } = await supabase
      .from("challenges")
      .update({ status })
      .eq("id", challengeId);

    if (error) {
      console.error("Fehler beim Aktualisieren:", error.message);
    } else {
      fetchChallenges();
    }
  };

  const totalPoints = challenges.reduce((acc, c) => {
    if (c.status === "done" && c.player) {
      acc[c.player] = (acc[c.player] || 0) + c.points;
    }
    return acc;
  }, {});

  return (
    <div className="container">
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </Head>
      <h1 className="title">🎒 Roadtrip Challenge Picker</h1>

      <button
        onClick={() => setShowAll(!showAll)}
        className="button"
      >
        {showAll ? "Challenge-Liste verbergen" : "Alle Challenges anzeigen"}
      </button>

      {step === "idle" && (
        <button
          onClick={() => setStep("choosePlayer")}
          className="button"
        >
          Challenge ziehen
        </button>
      )}

      {step === "choosePlayer" && (
        <div className="button-group">
          <button
            onClick={() => {
              setSelectedPlayer("Paul");
              setStep("choosePoints");
            }}
            className="button"
          >
            Paul wählt
          </button>
          <button
            onClick={() => {
              setSelectedPlayer("Marcel");
              setStep("choosePoints");
            }}
            className="button"
          >
            Marcel wählt
          </button>
        </div>
      )}

      {step === "choosePoints" && (
        <div className="button-group">
          {[1, 2, 3, 4, 5].map((p) => (
            <button
              key={p}
              onClick={() => {
                setSelectedPoints(p);
                setStep("enterCode");
              }}
              className="button small-button"
            >
              {p} Punkte
            </button>
          ))}
        </div>
      )}

      {step === "enterCode" && (
        <div className="form-section">
          <input
            type="password"
            placeholder="Geheimcode eingeben"
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value)}
            className="input"
          />
          <button
            onClick={() => {
              if (codeInput === "0301") {
                const filtered = challenges.filter(
                  (c) => c.status === null && c.points === selectedPoints
                );
                if (filtered.length === 0) {
                  alert("Keine passende Challenge gefunden.");
                  setStep("idle");
                  return;
                }
                const chosen = filtered[Math.floor(Math.random() * filtered.length)];
                setCurrentChallenge({ ...chosen, player: selectedPlayer });
                setStep("result");
              } else {
                setStep("idle");
              }
            }}
            className="button"
          >
            Bestätigen
          </button>
        </div>
      )}

      {step === "result" && currentChallenge && (
        <div className="challenge-card">
          <p className="challenge-text">{currentChallenge.text}</p>
          <p className="challenge-subtext">Punkte: {currentChallenge.points}</p>
          <p className="challenge-subtext small-text">Zuständig: {currentChallenge.player}</p>
          <div className="button-group">
            <button
              className="button success-button"
              onClick={async () => {
                await supabase
                  .from("challenges")
                  .update({ status: "done", player: currentChallenge.player })
                  .eq("id", currentChallenge.id);
                setCurrentChallenge(null);
                setStep("idle");
                fetchChallenges();
              }}
            >
              ✅ Erledigt
            </button>
            <button
              className="button failure-button"
              onClick={async () => {
                await supabase
                  .from("challenges")
                  .update({ status: "failed", player: currentChallenge.player })
                  .eq("id", currentChallenge.id);
                setCurrentChallenge(null);
                setStep("idle");
                fetchChallenges();
              }}
            >
              ❌ Fehlgeschlagen
            </button>
          </div>
        </div>
      )}

      <button onClick={() => setShowForm(!showForm)} className="button">
        {showForm ? "Challenge-Formular verbergen" : "Neue Challenge einreichen"}
      </button>

      {showForm && (
        <div className="form-section">
          <h2 className="form-title">Neue Challenge einreichen</h2>

          <label className="form-label">Challenge Text</label>
          <textarea
            value={newChallengeText}
            onChange={(e) => setNewChallengeText(e.target.value)}
            className="textarea"
          />

          <label className="form-label">Dein Name</label>
          <input
            value={newAuthor}
            onChange={(e) => setNewAuthor(e.target.value)}
            className="input"
          />

          <label className="form-label">Punkte (1-5)</label>
          <input
            type="number"
            value={newPoints}
            onChange={(e) => setNewPoints(e.target.value)}
            min={1}
            max={5}
            className="input"
          />

          <button onClick={submitChallenge} className="button">
            Challenge hinzufügen
          </button>
        </div>
      )}

      {showAll && (
        <div className="challenge-list">
          <h2 className="form-title">Alle Challenges</h2>
          {challenges.map((c, i) => (
            <div key={i} className="challenge-card small-card">
              <p className="challenge-text">{c.text}</p>
              <p className="challenge-subtext">
                Punkte: {c.points} | Von: {c.author} | Am: {new Date(c.date).toLocaleString()} | Spieler: {c.player || "-"}
              </p>
              <p className="challenge-subtext">
                Status: {c.status === "done" ? "✅ Erledigt" : c.status === "failed" ? "❌ Fehlgeschlagen" : "⏳ Offen"}
              </p>
              <div className="button-group">
                <button onClick={() => updateChallengeStatus(c.id, "done")} className="button small-button success-button">✅</button>
                <button onClick={() => updateChallengeStatus(c.id, "failed")} className="button small-button failure-button">❌</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="leaderboard">
        <h2 className="form-title">🏆 Leaderboard</h2>
        <p>Paul: {totalPoints["Paul"] || 0} Punkte</p>
        <p>Marcel: {totalPoints["Marcel"] || 0} Punkte</p>
      </div>
    </div>
  );
}
