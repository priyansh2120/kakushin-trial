import React from "react";
import { Pie } from "react-chartjs-2";

const ChartComponent = ({ data, title }) => {
  // Custom options to adjust the size of the Pie chart
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false, // This ensures the chart fits within its container
    plugins: {
      legend: {
        labels: {
          color: 'white' ,
          font: {
            size: 16
          }
        }
      }
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <div style={{ maxWidth: "400px", margin: "0 auto" }}>
        <Pie data={data} options={chartOptions} />
      </div>
    </div>
  );
};

export default ChartComponent;
