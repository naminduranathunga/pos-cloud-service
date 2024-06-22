export default interface ProductCategory {
    id: number;
    name: string;
    parent_id?: number | {id: number, name: string} | null;
}