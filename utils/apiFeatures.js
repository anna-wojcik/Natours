class APIFeatures {
  constructor(query, queryObject) {
    this.query = query;
    this.queryObject = queryObject;
  }

  filter() {
    const queryObj = { ...this.queryObject };
    const excludeFields = ['page', 'sort', 'limit', 'fields'];
    excludeFields.forEach((el) => delete queryObj[el]);

    // 1B) Advanced Filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);
    // // \b - spasowuje tylko te konkretne słowa, odrzuca takie gdzie występuje takie wyrażenia
    // // g - zamienia wszytskie wystąpienia

    // // potrzebujemy: { duration: { $gte: '5' }, difficulty: 'easy' }
    // // z urla dostajemy: { duration: { gte: '5' }, difficulty: 'easy' }
    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    // 2) Sorting
    if (this.queryObject.sort) {
      const sortBy = this.queryObject.sort.split(',').join(' ');
      // sort('price ratingsAverage')
      this.query = this.query.sort(sortBy); // korzystamy z mongoose sort
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  limitFields() {
    // 3) Field limiting - wyświetlanie tylko wskazanych atrybutów (danych pól)
    if (this.queryObject.fields) {
      const fields = this.queryObject.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  paginate() {
    // 4) Pagination
    // page=2&limit=10, 1-10 page 1, 11-20 page 2, 21-30, page 3
    const page = this.queryObject.page * 1 || 1;
    const limit = this.queryObject.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
