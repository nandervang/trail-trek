import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface WeightChartProps {
  data: {
    category: string;
    weight: number;
    color: string;
  }[];
  totalWeight: number;
}

export default function WeightChart({ data, totalWeight }: WeightChartProps) {
  const chartData: ChartData<'doughnut'> = {
    labels: data.map(item => item.category),
    datasets: [
      {
        data: data.map(item => item.weight),
        backgroundColor: data.map(item => item.color),
        borderColor: data.map(item => item.color),
        borderWidth: 1,
      },
    ],
  };

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: {
            family: 'Inter',
            size: 12,
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.raw as number;
            const percentage = ((value / totalWeight) * 100).toFixed(1);
            return `${context.label}: ${value.toFixed(2)}kg (${percentage}%)`;
          },
        },
      },
    },
    cutout: '70%',
  };

  return (
    <div className="relative aspect-square max-w-md mx-auto">
      <Doughnut data={chartData} options={options} />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-3xl font-light">{totalWeight.toFixed(2)}</div>
          <div className="text-sm text-gray-500">kg total</div>
        </div>
      </div>
    </div>
  );
}