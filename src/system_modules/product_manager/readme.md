# Product Manager - Developer Manual

## Introduction

Product Manager is a module that allows you to manage products in your system. It provides a set of APIs to create, update, delete and retrieve products. It also provides APIs to manage product categories and product attributes.

<ul>
    <li><a href="#create-category">Create Product Category</a></li>
    <li><a href="#configuration">Get Product Categories</a></li>
    <li><a href="#api-reference"></a></li>
</ul>


## Create Product Category 

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
