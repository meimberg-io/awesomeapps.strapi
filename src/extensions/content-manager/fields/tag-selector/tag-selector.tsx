import React, { useState, useEffect } from 'react';
import Select, { MultiValue, ActionMeta } from 'react-select';
import { request } from '@strapi/helper-plugin';

interface Tag {
    id: number;
    name: string;
}

interface TagSelectorProps {
    attribute: any;
    value: Tag[];
    onChange: (value: Tag[]) => void;
}

const TagSelector: React.FC<TagSelectorProps> = ({ value, onChange }) => {
    const [tags, setTags] = useState<Tag[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchTags = async () => {
            setIsLoading(true);
            try {
                const data: Tag[] = await request('/tags', { method: 'GET' });
                setTags(data);
            } catch (error) {
                console.error('Error fetching tags:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTags();
    }, []);

    const handleCreateTag = async (inputValue: string) => {
        setIsLoading(true);
        try {
            const newTag: Tag = await request('/tags', {
                method: 'POST',
                body: { name: inputValue },
            });
            setTags((prev) => [...prev, newTag]);
            onChange([...value, newTag]);
        } catch (error) {
            console.error('Error creating tag:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (
        selectedOptions: MultiValue<{ label: string; value: number }>,
        actionMeta: ActionMeta<{ label: string; value: number }>
    ) => {
        const selectedTags = selectedOptions.map((option) => ({
            id: option.value,
            name: option.label,
        }));
        onChange(selectedTags);
    };

    return (
        <Select
            isMulti
    options={tags.map((tag) => ({ label: tag.name, value: tag.id }))}
    value={value.map((tag) => ({ label: tag.name, value: tag.id }))}
    isLoading={isLoading}
    onChange={handleChange}
    onCreateOption={handleCreateTag}
    />
);
};

export default TagSelector;
