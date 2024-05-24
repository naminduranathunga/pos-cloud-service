# Product Manager - Developer Manual

## Introduction

Product Manager is a module that allows you to manage products in your system. It provides a set of APIs to create, update, delete and retrieve products. It also provides APIs to manage product categories and product attributes.

<ul>
    <li><a href="#create-category">Create Product Category</a></li>
    <li><a href="#configuration">Get Product Categories</a></li>
    <li><a href="#api-reference"></a></li>
</ul>


### Create Product Category 

To create a product category, you need to send a POST request to the following endpoint:

```
POST /api/v1/product-manager/categories/create
```

The request body should contain the following parameters:

| Parameter | Description |
| --- | --- |
| name | The name of the category. |
| parent | The ID of the parent category. (Optional) |

The response will contain the ID of the newly created category.

```json
{
    "id": "5f7b1b7b4b4b4b4b4b4b4b4b"
}
```

if any error occurs, the response will contain an error message.

```json
{
    "error": "Category name is required."
}
```

Example request body:

```json
{
    "name": "Electronics",
    "parent": "5f7b1b7b4b4b4b4b4b4b4b4b"
}
```


## Products

### Get Products

> GET /api/v1/product-manager/products/get

Get the list of products

| Parameter | Description |
| --- | --- |
| _id | (optional) |
| page | (optional) default page is 1 |
| per_page | (optional) no. of products per page. default - 100 |
| barcode | (optional) get product by barcode |
| status | (optional) active, inactive or all. default - all |
| _id | (optional) get the product by product id |

if the request processed without an error, it will return a json array of products.

```json
[
    {
        _id: string;
        name: string;
        company: string;


    }
]
```


### Get Product Thumbnail Image

product might have a thumbnail image. To retirve it, send the thumbnail file name to this endpoint.

> GET /api/v1/product-manager/products/get-thumbnail

This endpoint needs the *image_file* parameter. The system will automatically convert images to the webp format.

> GET /api/v1/product-manager/products/get-thumbnail?image_file=abc_efgh.webp

The endpoint will return the image file. *memeType: image/webp*



### Create Product

> POST /api/v1/product-manager/products/create

Request body: (JSON)
```json
{
    name: string;
    sku: string;
    inventory_type: string;
    category?: string;
    is_active: boolean;
    prices: Array<number>;
    barcodes?: Array<string>;
    size: string;
    weight: string;
}
```

On success,
```json
{
    _id: string;
    name: string;
    sku: string;
    inventory_type: string;
    category: string;
    is_active: boolean;
    prices: Array<number>;
    barcodes?: Array<string>;
    size: string;
    weight: string;
}
```


### Add Thumbnail Image to a Product

> POST /api/v1/product-manager/products/add-thumbnail

This endpoint will accept only *multipart form data*. Maximum file size is defined in .env file as `PRODUTCT_THUMBNAIL_MAX_SIZE` in KB.

| Parameter | Description |
| --- | --- |
| product_id | Product id. (required) |
| thumbnail | The image file. (required) |

Supported types are defined in `PRODUCT_THUMBNAIL_TYPE`. The files will be automatically converted to the webp files to optimized. 

Response on success:
```json
{
    message: "Thumbnail added successfully"
}
```


### Create Product

> POST /api/v1/product-manager/products/create

Request body: (JSON)
```json
{
    _id: string;
    name?: string;
    sku?: string;
    inventory_type?: string;
    category?: string;
    is_active?: boolean;
    prices?: Array<number>;
    barcodes?: Array<string>;
    size?: string;
    weight?: string;
}
```
