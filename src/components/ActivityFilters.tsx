import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X } from 'lucide-react';

interface ActivityFiltersProps {
  onFilterChange: (filters: ActivityFilters) => void;
  onReset: () => void;
}

export interface ActivityFilters {
  startDate?: string;
  endDate?: string;
  action?: string;
  entityType?: string;
}

export function ActivityFilters({ onFilterChange, onReset }: ActivityFiltersProps) {
  const [filters, setFilters] = useState<ActivityFilters>({});

  const handleFilterChange = (key: keyof ActivityFilters, value: string) => {
    const newFilters = { ...filters, [key]: value || undefined };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    setFilters({});
    onReset();
  };

  const hasActiveFilters = Object.values(filters).some(v => v);

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Date Range */}
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={filters.endDate || ''}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </div>

          {/* Action Type */}
          <div className="space-y-2">
            <Label htmlFor="action">Action Type</Label>
            <Select
              value={filters.action || 'all'}
              onValueChange={(value) => handleFilterChange('action', value === 'all' ? '' : value)}
            >
              <SelectTrigger id="action">
                <SelectValue placeholder="All actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All actions</SelectItem>
                <SelectItem value="LOGIN">Login</SelectItem>
                <SelectItem value="LOGOUT">Logout</SelectItem>
                <SelectItem value="CREATE">Create</SelectItem>
                <SelectItem value="UPDATE">Update</SelectItem>
                <SelectItem value="DELETE">Delete</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Entity Type */}
          <div className="space-y-2">
            <Label htmlFor="entityType">Entity Type</Label>
            <Select
              value={filters.entityType || 'all'}
              onValueChange={(value) => handleFilterChange('entityType', value === 'all' ? '' : value)}
            >
              <SelectTrigger id="entityType">
                <SelectValue placeholder="All entities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All entities</SelectItem>
                <SelectItem value="USER">User</SelectItem>
                <SelectItem value="PRODUCT">Product</SelectItem>
                <SelectItem value="MACHINE">Machine</SelectItem>
                <SelectItem value="ORDER">Order</SelectItem>
                <SelectItem value="CAMPAIGN">Campaign</SelectItem>
                <SelectItem value="CATEGORY">Category</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Reset Button */}
        {hasActiveFilters && (
          <div className="mt-4 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Reset Filters
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
