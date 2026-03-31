import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import GigCard from "@/components/molecules/GigCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { useLocation } from "wouter";

export default function Marketplace() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split("?")[1]);
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [maxPrice, setMaxPrice] = useState<number>(250);
  const [maxDeliveryDays, setMaxDeliveryDays] = useState<number | null>(null);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<"relevance" | "price" | "delivery" | "rating">("relevance");
  const [showFilters, setShowFilters] = useState(false);

  const { data: gigs, isLoading } = trpc.gigs.list.useQuery({});

  // Filter and sort gigs client-side
  const filteredGigs = gigs
    ?.filter((gig) => {
      if (maxPrice && Number(gig.price) > maxPrice) return false;
      if (maxDeliveryDays && gig.deliveryDays > maxDeliveryDays) return false;
      if (minRating && (Number(gig.averageRating) || 0) < minRating) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price":
          return Number(a.price) - Number(b.price);
        case "delivery":
          return a.deliveryDays - b.deliveryDays;
        case "rating":
          return (Number(b.averageRating) || 0) - (Number(a.averageRating) || 0);
        default:
          return (b.completedOrders || 0) - (a.completedOrders || 0);
      }
    });

  const categoriesHierarchy = [
    { name: "Design", icon: "🎨", subcategories: ["Logo Design", "Grafik Design", "UI/UX Design"] },
    { name: "Marketing", icon: "📱", subcategories: ["Social Media", "SEO", "Content Marketing"] },
    { name: "Schreiben", icon: "✍️", subcategories: ["Content Writing", "Copywriting", "Blogging"] },
    { name: "Video & Audio", icon: "🎬", subcategories: ["Video Editing", "Animation", "Voice Over"] },
    { name: "Entwicklung", icon: "💻", subcategories: ["Web Development", "App Development", "WordPress"] },
  ];

  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const allCategories = categoriesHierarchy.flatMap((cat) => cat.subcategories);

  const activeFiltersCount = [
    maxPrice < 250,
    maxDeliveryDays !== null,
    minRating !== null,
    category !== "",
  ].filter(Boolean).length;

  const clearFilters = () => {
    setMaxPrice(250);
    setMaxDeliveryDays(null);
    setMinRating(null);
    setCategory("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-slate-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-5xl font-black text-slate-900 mb-4">
            🔍 Gig-Marktplatz
          </h1>
          <p className="text-xl text-slate-700 font-semibold">
            <span className="text-blue-600 font-bold">{filteredGigs?.length || 0}</span> Gigs gefunden
          </p>
        </div>

        {/* Search & Filters Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 space-y-6 border-2 border-blue-100">
          {/* Search */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-blue-600" />
              <Input
                type="text"
                placeholder="Gigs durchsuchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-14 py-3 text-lg rounded-xl border-2 border-slate-200 hover:border-blue-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-200 relative"
            >
              <SlidersHorizontal className="h-6 w-6 mr-2" />
              Filter
              {activeFiltersCount > 0 && (
                <Badge className="ml-2 bg-red-500 text-white px-2.5 py-1 text-sm font-bold rounded-full">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </div>

          {/* Hierarchical Category Navigation */}
          <div className="space-y-3">
            <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide flex-wrap">
              <Badge
                variant={category === "" ? "default" : "outline"}
                className="cursor-pointer whitespace-nowrap px-4 py-2 text-base font-bold rounded-lg hover:bg-blue-100 transition-all"
                onClick={() => setCategory("")}
              >
                Alle
              </Badge>
              {categoriesHierarchy.map((cat) => (
                <Badge
                  key={cat.name}
                  variant={expandedCategory === cat.name ? "default" : "outline"}
                  className="cursor-pointer whitespace-nowrap flex items-center gap-2 px-4 py-2 text-base font-bold rounded-lg hover:shadow-md transition-all"
                  onClick={() => setExpandedCategory(expandedCategory === cat.name ? null : cat.name)}
                >
                  <span className="text-xl">{cat.icon}</span>
                  {cat.name}
                  <ChevronDown className="h-4 w-4" />
                </Badge>
              ))}
            </div>

            {expandedCategory && (
              <div className="bg-white rounded-lg p-4 border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <span>{categoriesHierarchy.find((c) => c.name === expandedCategory)?.icon}</span>
                  {expandedCategory}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {categoriesHierarchy
                    .find((c) => c.name === expandedCategory)
                    ?.subcategories.map((subcat) => (
                      <Button
                        key={subcat}
                        variant={category === subcat ? "default" : "outline"}
                        size="sm"
                        className="justify-start"
                        onClick={() => {
                          setCategory(subcat);
                          setExpandedCategory(null);
                        }}
                      >
                        {subcat}
                      </Button>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="pt-4 border-t border-slate-200 space-y-4">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Max Price */}
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Max. Preis: {maxPrice}€
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="250"
                    step="10"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                {/* Max Delivery Days */}
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Lieferzeit
                  </label>
                  <Select
                    value={maxDeliveryDays?.toString() || "all"}
                    onValueChange={(value) =>
                      setMaxDeliveryDays(value === "all" ? null : Number(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Alle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle</SelectItem>
                      <SelectItem value="1">≤ 1 Tag</SelectItem>
                      <SelectItem value="2">≤ 2 Tage</SelectItem>
                      <SelectItem value="3">≤ 3 Tage</SelectItem>
                      <SelectItem value="7">≤ 7 Tage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Min Rating */}
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Bewertung
                  </label>
                  <Select
                    value={minRating?.toString() || "all"}
                    onValueChange={(value) =>
                      setMinRating(value === "all" ? null : Number(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Alle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle</SelectItem>
                      <SelectItem value="4">≥ 4 Sterne</SelectItem>
                      <SelectItem value="4.5">≥ 4.5 Sterne</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort */}
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Sortierung
                  </label>
                  <Select
                    value={sortBy}
                    onValueChange={(value: any) => setSortBy(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Relevanz</SelectItem>
                      <SelectItem value="price">Preis (niedrig)</SelectItem>
                      <SelectItem value="delivery">Lieferzeit</SelectItem>
                      <SelectItem value="rating">Bewertung</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-slate-600"
                >
                  <X className="h-4 w-4 mr-2" />
                  Filter zurücksetzen
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Gigs Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg h-96 animate-pulse"
              />
            ))}
          </div>
        ) : filteredGigs && filteredGigs.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredGigs.map((gig) => (
              <GigCard
                key={gig.id}
                id={gig.id}
                title={gig.title}
                price={gig.price}
                deliveryDays={gig.deliveryDays}
                seller={{
                  name: "Verkäufer",
                  verified: true,
                  badges: ["DACH"],
                }}
                metrics={{
                  onTimeRate: 94,
                  firstPassRate: 87,
                  disputeRate: 3,
                }}
                averageRating={gig.averageRating ? Number(gig.averageRating) : undefined}
                completedOrders={gig.completedOrders || undefined}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Search className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Keine Gigs gefunden
            </h3>
            <p className="text-slate-600 mb-6">
              Versuche andere Suchbegriffe oder Filter
            </p>
            <Button onClick={clearFilters}>Filter zurücksetzen</Button>
          </div>
        )}
      </div>
    </div>
  );
}

