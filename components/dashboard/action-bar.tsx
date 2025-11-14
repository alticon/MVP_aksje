import { Button } from "@/components/ui/button";
import { Plus, DollarSign, Upload, Filter } from "lucide-react";

export function ActionBar() {
  return (
    <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
      <div className="flex items-center gap-3 flex-wrap">
        <Button className="bg-blue-500 hover:bg-blue-600">
          <Plus className="w-4 h-4 mr-2" />
          Ny transaksjon
        </Button>
        <Button className="bg-green-500 hover:bg-green-600">
          <DollarSign className="w-4 h-4 mr-2" />
          Registrer utbytte
        </Button>
        <Button className="bg-cyan-500 hover:bg-cyan-600">
          <Upload className="w-4 h-4 mr-2" />
          Last opp sluttseddel
        </Button>
      </div>
      <Button variant="outline">
        <Filter className="w-4 h-4 mr-2" />
        Filter
      </Button>
    </div>
  );
}
