

import type { Product} from "../types/product"


const PRODUCTS_URL = 'https://s3.us-east-1.amazonaws.com/assets.spotandtango/products.json'


type ApiProduct = {
    id: string 
    name: string
    group: string
    msrp: number | string
    price: number 
    status: "Available"| "Unavailable"
  }

  
export async function fetchProducts(): Promise<Product[]>{
    const res = await fetch(PRODUCTS_URL)
    if(!res.ok){
        throw new Error(`Failed to fetch products from ${PRODUCTS_URL}`)
    }

    const data:ApiProduct[] = await res.json()

    return data.map((item)=>({
        id:item.id,
        name:item.name,
        category:item.group as Product['category'],
        msrp:Number(item.msrp),
        price:Number(item.price),
        available: item.status === 'Available'
    }))
   

}