
'use client';

import { useState, useRef, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup } from "@/components/ui/select";
import { CategoryFormModal } from '../categories/category-form-modal';
import { Separator } from '@/components/ui/separator';
import { useStores } from '@/contexts/stores-context';

interface CategorySelectProps {
  value?: string;
  onChange?: (value: string) => void;
}

export function CategorySelect({ value, onChange }: CategorySelectProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any | null>(null);
    const { categories, getCategories } = useStores();

    useEffect(() => {
        getCategories();
    }, []);

    const longPressTimer = useRef<NodeJS.Timeout | null>(null);

    const handlePointerDown = (category: any) => {
        longPressTimer.current = setTimeout(() => {
            setEditingCategory(category);
            setIsModalOpen(true);
        }, 500); 
    };

    const handlePointerUp = () => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
    };
    
    const handleDoubleClick = (category: any) => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
        setEditingCategory(category);
        setIsModalOpen(true);
    };

    const handleCreateNew = () => {
        setEditingCategory(null);
        setIsModalOpen(true);
    };

    return (
        <>
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger className='border-none bg-light text-primary shadow-xl'>
                    <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup >
                        {categories.map((category: any) => (
                            <SelectItem     
                                key={category.id} 
                                value={category.id}
                                onDoubleClick={() => handleDoubleClick(category)}
                                onPointerDown={() => handlePointerDown(category)}
                                onPointerUp={handlePointerUp}
                                onPointerLeave={handlePointerUp}
                            >
                                {category.name}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                    <Separator />
                    <div 
                        className="relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                        onClick={handleCreateNew}
                    >
                        Crear nueva categoría...
                    </div>
                </SelectContent>
            </Select>

            <CategoryFormModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialData={editingCategory}
            />
        </>
    );
}
