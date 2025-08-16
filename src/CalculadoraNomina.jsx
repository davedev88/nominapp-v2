import { useState } from "react";

const horarioBase = {
  entrada: "18:50",
  salida: "02:00",
  flexible: 0, // en minutos
  festivo: false,
  weekend: false,
};

const diasPorDefecto = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

const calcularHorasNocturnas = (entrada, salida) => {
  const [h1, m1] = entrada.split(":").map(Number);
  const [h2, m2] = salida.split(":").map(Number);

  let start = h1 * 60 + m1;
  let end = h2 < h1 ? h2 * 60 + m2 + 1440 : h2 * 60 + m2;

  const nocturnaInicio = 22 * 60;
  const nocturnaFin = 6 * 60 + 1440;

  let nocturna = 0;
  for (let t = start; t < end; t++) {
    if (t >= nocturnaInicio || t < nocturnaFin - 1440) nocturna++;
  }
  return nocturna;
};

export default function CalculadoraNomina() {
  const [turnoBase, setTurnoBase] = useState({
    dias: diasPorDefecto,
    entrada: "18:50",
    salida: "02:00",
  });

  const [irpf, setIrpf] = useState(14);

  const [horario, setHorario] = useState(
    turnoBase.dias.map(() => ({ ...horarioBase }))
  );
  const [resultado, setResultado] = useState(null);

  const calcular = () => {
    let totalBruto = 0;
    let totalMinutos = 0;

    horario.forEach((dia) => {
      const baseMinutos = 7 * 60 + 10;
      const minutosFlexibles = parseInt(dia.flexible || 0);
      const totalDiaMinutos = baseMinutos + minutosFlexibles;
      totalMinutos += totalDiaMinutos;

      const tarifaBase = 14.64 / 60;
      const plusNocturno = 3.72 / 60;
      const plusFestivo = 10.98 / 60;
      const plusWeekend = 5.80 / 60;

      const nocturnos = calcularHorasNocturnas(
        dia.entrada || turnoBase.entrada,
        dia.salida || turnoBase.salida
      );

      totalBruto += totalDiaMinutos * tarifaBase;

      if (dia.flexible > 0 || dia.flexible === 0) {
        totalBruto += nocturnos * plusNocturno;
      }

      if (dia.festivo) {
        totalBruto +=
          nocturnos * (plusFestivo + plusNocturno) +
          (totalDiaMinutos - nocturnos) * plusFestivo;
      }

      if (dia.weekend) {
        totalBruto += totalDiaMinutos * plusWeekend;
      }
    });

    const neto = totalBruto * (1 - irpf / 100 - 0.11);

    setResultado({
      bruto: totalBruto.toFixed(2),
      neto: neto.toFixed(2),
      horas: (totalMinutos / 60).toFixed(2),
    });
  };

  return (
    <div className="p-4 max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Calculadora de Nómina</h1>

      <div className="flex gap-2 items-center">
        <label>IRPF (%):</label>
        <input
          type="number"
          value={irpf}
          onChange={(e) => setIrpf(parseFloat(e.target.value))}
          className="border px-2 py-1 rounded w-20"
        />
      </div>

      {horario.map((dia, i) => (
        <div key={i} className="border rounded p-4 space-y-2">
          <h2 className="font-semibold">{turnoBase.dias[i]}</h2>
          <div className="grid grid-cols-2 gap-4 items-center">
            <label>Hora entrada:</label>
            <input
              type="time"
              value={dia.entrada}
              onChange={(e) => {
                const copia = [...horario];
                copia[i].entrada = e.target.value;
                setHorario(copia);
              }}
            />

            <label>Hora salida:</label>
            <input
              type="time"
              value={dia.salida}
              onChange={(e) => {
                const copia = [...horario];
                copia[i].salida = e.target.value;
                setHorario(copia);
              }}
            />

            <label>Minutos flexibles (manual):</label>
            <input
              type="number"
              value={dia.flexible}
              onChange={(e) => {
                const copia = [...horario];
                copia[i].flexible = parseInt(e.target.value || 0);
                setHorario(copia);
              }}
            />

            <label>
              <input
                type="checkbox"
                checked={dia.festivo}
                onChange={(e) => {
                  const copia = [...horario];
                  copia[i].festivo = e.target.checked;
                  setHorario(copia);
                }}
              /> Festivo
            </label>

            <label>
              <input
                type="checkbox"
                checked={dia.weekend}
                onChange={(e) => {
                  const copia = [...horario];
                  copia[i].weekend = e.target.checked;
                  setHorario(copia);
                }}
              /> Weekend
            </label>
          </div>
        </div>
      ))}

      <button onClick={calcular} className="bg-blue-600 text-white px-4 py-2 rounded">
        Calcular nómina
      </button>

      {resultado && (
        <div className="text-lg font-semibold">
          <p>💰 Bruto semanal: {resultado.bruto} €</p>
          <p>🧾 Neto estimado: {resultado.neto} €</p>
          <p>⏱️ Total horas: {resultado.horas}</p>
        </div>
      )}
    </div>
  );
}
