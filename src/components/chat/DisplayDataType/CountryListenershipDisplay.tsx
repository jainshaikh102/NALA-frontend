import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import ReactCountryFlag from "react-country-flag";

interface CountryListenershipItem {
  countryCode: string;
  percentage: number;
}

interface CountryListenershipDisplayProps {
  data: CountryListenershipItem[];
  title?: string;
}

// Country code to country name mapping
const getCountryName = (countryCode: string): string => {
  const countryNames: { [key: string]: string } = {
    us: "United States",
    gb: "United Kingdom",
    ca: "Canada",
    ng: "Nigeria",
    nl: "Netherlands",
    cr: "Costa Rica",
    other: "Other Countries",
  };

  return countryNames[countryCode.toLowerCase()] || countryCode.toUpperCase();
};

// Component to render country flag using react-country-flag
const CountryFlag: React.FC<{ countryCode: string }> = ({ countryCode }) => {
  // Handle special case for "other"
  if (countryCode.toLowerCase() === "other") {
    return <span className="text-sm">🌍</span>;
  }

  return (
    <ReactCountryFlag
      countryCode={countryCode.toUpperCase()}
      svg
      style={{
        width: "1em",
        height: "1em",
      }}
      title={countryCode.toUpperCase()}
    />
  );
};

const CountryListenershipDisplay: React.FC<CountryListenershipDisplayProps> = ({
  data,
  title,
}) => {
  // Validate data structure
  if (!Array.isArray(data)) {
    return <div>Invalid data format</div>;
  }

  if (data.length === 0) {
    return <div>No country listenership data available</div>;
  }

  // Sort data by percentage in descending order
  const sortedData = [...data].sort((a, b) => b.percentage - a.percentage);

  return (
    <div className="space-y-4">
      {/* Country Listenership Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4">
        {sortedData.map((country, index) => (
          <Card
            key={`${country.countryCode}-${index}`}
            className="bg-card hover:bg-muted/50 transition-colors"
          >
            <CardContent className="p-4 text-center">
              <div className="space-y-2">
                {/* Country Flag */}

                {/* Percentage */}
                <div className="text-2xl font-bold text-white">
                  {country.percentage.toFixed(2)}%
                </div>

                {/* Country Name */}
                <div className="flex flex-row items-center justify-center gap-2">
                  <div className="flex justify-center">
                    <CountryFlag countryCode={country.countryCode} />
                  </div>
                  <h4 className="text-sm font-medium text-muted-foreground leading-tight">
                    {getCountryName(country.countryCode)}
                  </h4>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CountryListenershipDisplay;
