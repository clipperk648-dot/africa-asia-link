import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search } from "lucide-react";
import ThreeBackground from "@/components/ThreeBackground";

const SearchPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const trendingSearches = [
    "Technology",
    "Fashion",
    "Food & Dining",
    "Travel",
    "Fitness",
    "Photography",
    "Art & Design",
    "Music",
  ];

  const exploreContent = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=400&fit=crop",
      likes: 1234,
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=400&fit=crop",
      likes: 5678,
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=400&fit=crop",
      likes: 9012,
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=400&fit=crop",
      likes: 3456,
    },
    {
      id: 5,
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=400&fit=crop",
      likes: 7890,
    },
    {
      id: 6,
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=400&fit=crop",
      likes: 2345,
    },
  ];

  return (
    <div className="min-h-screen pb-20 relative">
      <ThreeBackground />

      {/* Header */}
      <header className="backdrop-blur-xl bg-card/80 border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-muted/50 border-none"
                autoFocus
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Trending Searches */}
        {!searchQuery && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Trending</h2>
            <div className="flex flex-wrap gap-2">
              {trendingSearches.map((search, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchQuery(search)}
                  className="rounded-full"
                >
                  {search}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Explore Grid */}
        <div>
          <h2 className="text-lg font-semibold mb-4">
            {searchQuery ? "Results" : "Explore"}
          </h2>
          <div className="grid grid-cols-3 gap-1">
            {exploreContent.map((item) => (
              <div
                key={item.id}
                className="relative aspect-square cursor-pointer group overflow-hidden"
              >
                <img
                  src={item.image}
                  alt="Explore content"
                  className="w-full h-full object-cover transition-transform group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <span className="text-white font-semibold">
                    ❤️ {item.likes.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SearchPage;
