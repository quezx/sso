class ClientSignupController {
  /* @ngInject */
  constructor($http, $stateParams, $timeout, urls) {
    this.$http = $http;
    this.$stateParams = $stateParams;
    this.$timeout = $timeout;
    this.urls = urls;
  }

  $onInit() {
    this.ui = { loading: false, success: false, error: false };
    this.resetData();
    this.EmployeeRange = [
      { name: '1', value: '1' },
      { name: '2-10', value: '2-10' },
      { name: '11-50', value: '11-50' },
      { name: '51-200', value: '51-200' },
      { name: '201-500', value: '201-500' },
      { name: '501-1000', value: '501-1000' },
      { name: '1001-5000', value: '1001-5000' },
      { name: '5001-10000', value: '5001-10000' },
      { name: '10000+', value: '10001-100000' },
    ];
  }

  resetData() {
    this.data = {
      signup_source_id: 1,
      allocate: {
        mgr_id: atob(this.$stateParams.userId),
        type: this.$stateParams.type,
      },
    };
  }

  message(type = '', err = {}) {
    this.ui[type] = (type === 'success')
      ? 'You have been successfully registered to Quezx.com'
      : (err.msg || 'An error occured please contact Quezx.com');
    if (type === 'success') this.resetData();
    this.$timeout(() => (this.ui[type] = ''), 5000);
    this.ui.loading = false;
  }

  create() {
    this.ui.loading = true;
    const { firstname, lastname, email, mobno, companyname } = this.data;
    const obj = this.$stateParams.type
      ? { name: `${firstname} ${lastname}` }
      : {
        fullname: `${firstname} ${lastname}`,
        email_id: email,
        contact_no: mobno,
        company_name: companyname,
      };
    Object.assign(this.data, obj);
    this.$http
    .post(`${this.urls.API_SERVER}/api/signUps`, this.data, {
      ignoreAuthModule: true,
    })
    .then(() => this.message('success'))
    .catch(({ data }) => this.message('error', data));
  }
}

export default ClientSignupController;