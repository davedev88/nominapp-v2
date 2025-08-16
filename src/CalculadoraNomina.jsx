
import { useState } from "react";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { Card, CardContent } from "./components/ui/card";

const horarioBase = {
  entrada: "18:50",
  salida: "02:00",
  flexible: null, // "azul" | "rojo" | null
  festivo: false,
  weekend: false,
};

const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

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
  return (nocturna / 60).toFixed(2);
};

export default function CalculadoraNomina() {
  const [horario, setHorario] = useState(
    diasSemana.map(() => ({ ...horarioBase }))
  );
  const [resultado, setResultado] = useState(null);

  const calcular = () => {
    let totalBruto = 0;
    let totalHoras = 0;

    horario.forEach((dia) => {
      let horas = 7.17;
      if (dia.flexible === "azul") horas += 1;
      else if (dia.flexible === "rojo") horas += 1;

      totalHoras += horas;

      let tarifaBase = 14.64;
      let plusNocturno = 3.72;
      let plusFestivo = 10.98;
      let plusWeekend = 5.80;

      let nocturnas = parseFloat(
        calcularHorasNocturnas(dia.entrada || "18:50", dia.salida || "02:00")
      );

      totalBruto += horas * tarifaBase;

      if (dia.flexible === "azul") totalBruto += nocturnas * plusNocturno;
      if (!dia.flexible) totalBruto += nocturnas * plusNocturno;

      if (dia.festivo)
        totalBruto +=
          nocturnas * (plusFestivo + plusNocturno) +
          (horas - nocturnas) * plusFestivo;

      if (dia.weekend) totalBruto += horas * plusWeekend;
    });

    const estimacionIRPF = 0.14;
    const estimacionSS = 0.11;
    const neto = totalBruto * (1 - estimacionIRPF - estimacionSS);

    setResultado({ bruto: totalBruto.toFixed(2), neto: neto.toFixed(2) });
  };

  return (
    <div className="p-4 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Calculadora de Nómina Semanal (Turno 4B)</h1>
      {horario.map((dia, i) => (
        <Card key={i}>
          <CardContent className="p-4 space-y-2">
            <h2 className="font-semibold">{diasSemana[i]}</h2>
            <div className="flex gap-2 items-center">
              <label>Flexible:</label>
              <select
                className="border rounded px-2 py-1"
                value={dia.flexible || ""}
                onChange={(e) => {
                  const copia = [...horario];
                  copia[i].flexible = e.target.value || null;
                  setHorario(copia);
                }}
              >
                <option value="">Ninguna</option>
                <option value="azul">Hecha (con plus)</option>
                <option value="rojo">No hecha (sin plus)</option>
              </select>
              <label className="ml-4">Festivo:</label>
              <input
                type="checkbox"
                checked={dia.festivo}
                onChange={(e) => {
                  const copia = [...horario];
                  copia[i].festivo = e.target.checked;
                  setHorario(copia);
                }}
              />
              <label className="ml-4">Weekend:</label>
              <input
                type="checkbox"
                checked={dia.weekend}
                onChange={(e) => {
                  const copia = [...horario];
                  copia[i].weekend = e.target.checked;
                  setHorario(copia);
                }}
              />
            </div>
          </CardContent>
        </Card>
      ))}

      <Button onClick={calcular}>Calcular nómina estimada</Button>

      {resultado && (
        <div className="text-lg font-semibold">
          <p>💰 Bruto semanal estimado: {resultado.bruto} €</p>
          <p>🧾 Neto aproximado (IRPF + SS): {resultado.neto} €</p>
        </div>
      )}
    </div>
  );
}
