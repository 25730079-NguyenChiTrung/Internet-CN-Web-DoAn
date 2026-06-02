import { FormEvent, useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { Exchange } from '@/types/models';

export interface StockFilters {
    search: string;
    sector: string;
    exchange: string;
    sort: string;
}

interface StockFilterProps {
    filters: StockFilters;
    sectorOptions: string[];
    exchangeOptions: Exchange[];
}

const sortOptions = [
    { value: 'symbol_asc', label: 'Mã A → Z' },
    { value: 'name_asc', label: 'Tên công ty A → Z' },
    { value: 'name_desc', label: 'Tên công ty Z → A' },
    { value: 'change_desc', label: 'Tăng mạnh nhất' },
    { value: 'change_asc', label: 'Giảm mạnh nhất' },
    { value: 'price_desc', label: 'Giá cao nhất' },
    { value: 'price_asc', label: 'Giá thấp nhất' },
];

function cleanFilters(values: StockFilters): Record<string, string> {
    return Object.fromEntries(
        Object.entries(values).filter(([, value]) => value !== '' && value !== 'symbol_asc'),
    );
}

export function StockFilter({ filters, sectorOptions, exchangeOptions }: StockFilterProps) {
    const [values, setValues] = useState<StockFilters>({
        search: filters.search ?? '',
        sector: filters.sector ?? '',
        exchange: filters.exchange ?? '',
        sort: filters.sort ?? 'symbol_asc',
    });

    useEffect(() => {
        setValues({
            search: filters.search ?? '',
            sector: filters.sector ?? '',
            exchange: filters.exchange ?? '',
            sort: filters.sort ?? 'symbol_asc',
        });
    }, [filters]);

    function submit(event?: FormEvent<HTMLFormElement>) {
        event?.preventDefault();
        router.get('/stocks', cleanFilters(values), {
            preserveState: true,
            replace: true,
        });
    }

    function reset() {
        const nextValues: StockFilters = {
            search: '',
            sector: '',
            exchange: '',
            sort: 'symbol_asc',
        };
        setValues(nextValues);
        router.get('/stocks', {}, { preserveState: true, replace: true });
    }

    return (
        <Card>
            <CardContent className="p-4">
                <form onSubmit={submit} className="grid gap-3 lg:grid-cols-[1.5fr_1fr_1fr_1fr_auto]">
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={values.search}
                            onChange={(event) =>
                                setValues((current) => ({ ...current, search: event.target.value }))
                            }
                            placeholder="Tìm theo mã hoặc tên công ty"
                            className="pl-9"
                        />
                    </div>

                    <Select
                        value={values.sector || 'all'}
                        onValueChange={(value) =>
                            setValues((current) => ({
                                ...current,
                                sector: value === 'all' ? '' : value,
                            }))
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Ngành" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả ngành</SelectItem>
                            {sectorOptions.map((sector) => (
                                <SelectItem key={sector} value={sector}>
                                    {sector}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={values.exchange || 'all'}
                        onValueChange={(value) =>
                            setValues((current) => ({
                                ...current,
                                exchange: value === 'all' ? '' : value,
                            }))
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Sàn" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả sàn</SelectItem>
                            {exchangeOptions.map((exchange) => (
                                <SelectItem key={exchange} value={exchange}>
                                    {exchange}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={values.sort}
                        onValueChange={(value) =>
                            setValues((current) => ({ ...current, sort: value }))
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Sắp xếp" />
                        </SelectTrigger>
                        <SelectContent>
                            {sortOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <div className="flex gap-2">
                        <Button type="submit" className="flex-1 lg:flex-none">
                            <SlidersHorizontal className="h-4 w-4" />
                            Lọc
                        </Button>
                        <Button type="button" variant="outline" onClick={reset}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
