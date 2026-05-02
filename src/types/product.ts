

export type Category = 'Laptop' | 'Tablet' | 'Mobile'| 'Accessory'

export type Product = {
    id:string,
    name:string,
    category:Category,
    msrp:number,
    price:number,
    available:boolean


}