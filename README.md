# Youtube Scrapper

- AWS
  - Lambda
  - S3

```js
// Function's parameters
{
    name, //Channel name
    href, //Youtube's relative path eg: /channel/11231231
    depth, //Current depth of the recursive function (number)
    maxDepth, //Max depth that the recursive function can go (number)
    sufix, //A sufix that is passed to all childs of the parent function and it's appended at the end of each filename
}
```
