import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { validateDataStructure } from "@/helpers/formatters";

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
    // Common country codes
    us: "United States",
    gb: "United Kingdom",
    ca: "Canada",
    au: "Australia",
    de: "Germany",
    fr: "France",
    it: "Italy",
    es: "Spain",
    nl: "Netherlands",
    be: "Belgium",
    ch: "Switzerland",
    at: "Austria",
    se: "Sweden",
    no: "Norway",
    dk: "Denmark",
    fi: "Finland",
    ie: "Ireland",
    pt: "Portugal",
    pl: "Poland",
    cz: "Czech Republic",
    hu: "Hungary",
    ro: "Romania",
    bg: "Bulgaria",
    hr: "Croatia",
    si: "Slovenia",
    sk: "Slovakia",
    lt: "Lithuania",
    lv: "Latvia",
    ee: "Estonia",
    gr: "Greece",
    cy: "Cyprus",
    mt: "Malta",
    lu: "Luxembourg",
    is: "Iceland",
    li: "Liechtenstein",
    mc: "Monaco",
    sm: "San Marino",
    va: "Vatican City",
    ad: "Andorra",
    ru: "Russia",
    ua: "Ukraine",
    by: "Belarus",
    md: "Moldova",
    rs: "Serbia",
    me: "Montenegro",
    ba: "Bosnia and Herzegovina",
    mk: "North Macedonia",
    al: "Albania",
    xk: "Kosovo",
    tr: "Turkey",
    jp: "Japan",
    kr: "South Korea",
    cn: "China",
    in: "India",
    id: "Indonesia",
    th: "Thailand",
    vn: "Vietnam",
    ph: "Philippines",
    my: "Malaysia",
    sg: "Singapore",
    hk: "Hong Kong",
    tw: "Taiwan",
    mo: "Macau",
    br: "Brazil",
    ar: "Argentina",
    cl: "Chile",
    co: "Colombia",
    pe: "Peru",
    ec: "Ecuador",
    uy: "Uruguay",
    py: "Paraguay",
    bo: "Bolivia",
    ve: "Venezuela",
    gf: "French Guiana",
    sr: "Suriname",
    gy: "Guyana",
    mx: "Mexico",
    gt: "Guatemala",
    bz: "Belize",
    sv: "El Salvador",
    hn: "Honduras",
    ni: "Nicaragua",
    cr: "Costa Rica",
    pa: "Panama",
    cu: "Cuba",
    jm: "Jamaica",
    ht: "Haiti",
    do: "Dominican Republic",
    pr: "Puerto Rico",
    tt: "Trinidad and Tobago",
    bb: "Barbados",
    gd: "Grenada",
    lc: "Saint Lucia",
    vc: "Saint Vincent and the Grenadines",
    ag: "Antigua and Barbuda",
    kn: "Saint Kitts and Nevis",
    dm: "Dominica",
    bs: "Bahamas",
    za: "South Africa",
    ng: "Nigeria",
    ke: "Kenya",
    gh: "Ghana",
    ug: "Uganda",
    tz: "Tanzania",
    et: "Ethiopia",
    eg: "Egypt",
    ma: "Morocco",
    dz: "Algeria",
    tn: "Tunisia",
    ly: "Libya",
    sd: "Sudan",
    ss: "South Sudan",
    other: "Other Countries",
  };

  return countryNames[countryCode.toLowerCase()] || countryCode.toUpperCase();
};

// Local Error Handling Utilities
const createDataUnavailablePlaceholder = (
  message: string = "Data unavailable"
) => (
  <div className="p-4 bg-muted/20 rounded border border-dashed border-muted-foreground/30">
    <div className="flex items-center gap-2 text-muted-foreground">
      <AlertTriangle className="h-4 w-4" />
      <span className="text-sm">{message}</span>
    </div>
  </div>
);

const createMalformedDataFallback = (data: unknown) => {
  return (
    <div className="p-4 bg-orange-50/50 border border-orange-200 rounded">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <span className="text-sm font-medium text-orange-800">
          Data Structure Issue
        </span>
      </div>
      <p className="text-sm text-orange-700 mb-3">
        The data received doesn&apos;t match the expected format. Raw data is
        shown below:
      </p>
      <details className="group">
        <summary className="cursor-pointer text-sm text-orange-600 hover:text-orange-800 flex items-center gap-1">
          View Raw Data
        </summary>
        <pre className="mt-2 p-2 bg-orange-100 rounded text-xs overflow-auto max-h-40 text-orange-900">
          {JSON.stringify(data, null, 2)}
        </pre>
      </details>
    </div>
  );
};

const CountryListenershipDisplay: React.FC<CountryListenershipDisplayProps> = ({
  data,
  title,
}) => {
  // Validate data structure
  if (!Array.isArray(data)) {
    return createMalformedDataFallback(data);
  }

  if (data.length === 0) {
    return createDataUnavailablePlaceholder(
      "No country listenership data available"
    );
  }

  // Validate each country item structure
  const isValidCountryData = data.every(
    (item) =>
      typeof item === "object" &&
      item !== null &&
      typeof item.countryCode === "string" &&
      typeof item.percentage === "number"
  );

  if (!isValidCountryData) {
    return createMalformedDataFallback(data);
  }

  // Sort data by percentage in descending order
  const sortedData = [...data].sort((a, b) => b.percentage - a.percentage);

  return (
    <div className="space-y-4">
      {/* Section Title */}
      {/* {title && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <div className="h-px bg-border mt-2"></div>
        </div>
      )} */}

      {/* Country Listenership Grid - Single grid with country and percentage in each card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-3 gap-4">
        {sortedData.map((country, index) => (
          <Card
            key={`${country.countryCode}-${index}`}
            className="bg-card hover:bg-muted/50 transition-colors"
          >
            <CardContent className="p-4 text-center">
              <div className="space-y-2">
                {/* Country Name */}

                {/* Percentage */}
                <div className="text-2xl font-bold text-white">
                  {country.percentage.toFixed(2)}%
                </div>

                <h4 className="text-sm font-medium text-muted-foreground leading-tight">
                  {getCountryName(country.countryCode)}
                </h4>

                {/* Country Code (small) */}
                {/* <div className="text-xs text-muted-foreground uppercase">
                  {country.countryCode}
                </div> */}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CountryListenershipDisplay;
