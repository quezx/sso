angular.module('qui.hire')
  .config([
    '$stateProvider',
    '$urlRouterProvider',
    function quiStateConfig($stateProvider, $urlRouterProvider) {
      $urlRouterProvider.when('/', '/app/dashboard');
      $urlRouterProvider.otherwise('/access/404');
      $stateProvider
        .state('access', {
          url: '/access',
          template: '<div ui-view class="fade-in-right-big smooth"></div>',
        })
        .state('access.oauth', {
          url: '/oauth',
          templateUrl: 'html/oauth.quezx.html',
        })
        .state('access.404', {
          url: '/404',
          templateUrl: 'html/404.html',
        })
        .state('app', {
          abstract: true,
          url: '/app',
          templateUrl: 'html/hire.app.html',
        })
        .state('app.dashboard', {
          url: '/dashboard',
          templateUrl: 'html/dashboard.html',
        })
        .state('app.jobs', {
          abstract: true,
          url: '/jobs',
          templateUrl: 'html/jobs.html',
        })
        .state('app.jobs.new', {
          url: '/new',
          templateUrl: 'html/jobs.new.html',
        })
        .state('app.jobs.list', {
          url: '/',
          templateUrl: 'html/jobs.list.html',
        })
        .state('app.jobs.manage', {
          url: '/manage/{bucket}/{jobId}',
          templateUrl: 'html/jobs.manage.html',
        })
        .state('app.job', {
          abstract: true,
          url: '/job',
          template: '<div ui-view class="fade-in-right-big smooth"></div>',
        })
        .state('app.job.view', {
          url: '/{jobId}',
          templateUrl: 'html/job.view.html',
        })
        .state('app.applicants', {
          url: '/applicants/{bucket}',
          templateUrl: 'html/applicants.html',
        })
        .state('app.applicant', {
          abstract: true,
          url: '/applicant',
          template: '<div ui-view class="fade-in-right-big smooth"></div>',
        })
        .state('app.applicant.view', {
          url: '/{applicantId}',
          templateUrl: 'html/applicant.view.html',
        })
        .state('app.calendar', {
          url: '/calendar',
          templateUrl: 'html/calendar.html',
        });
    },
  ]);