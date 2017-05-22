/*
* The MIT License (MIT)
*
* Copyright (c) 2016 Develer devginie
*
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in all
* copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
* SOFTWARE.
*/

/* global $ */
/* global angular */
/* global jQuery */

angular.module('angular-jqgrid', []).directive('jqGrid', function() {
  return {
    restrict: 'EA',
    template: '<table></table>',
    scope: {
      dataset: '=',
      options: '=',
      callback: '=',
      pager: '='
    },
    link: function(scope, element, attributes) {
      var jqGrid = null;
      var height = attributes.height || '100%';

      var init = function() {
        var gridObj;

        if (scope.dataset === undefined) {
          // Exception process if dataset is empty.
          return gridObj;
        }

        var options = {};

        options.data = scope.dataset;

        options = $.extend(true, options, scope.options);

        options.height = height;

        gridObj = $(element.children()[0]).jqGrid(options);

        if (scope.callback) {
          scope.callback(gridObj);
        }

        return gridObj;
      };

      //
      // Events
      //
      // Window Resize
      $(window).on('resize', function() {
        var parentElement = angular.element(element).parent();
        jqGrid.setGridWidth(parentElement.width());
      });

      /**
      * Watches
      */
      var onOptionsChanged = function() {
        jqGrid = init();
      };

      var unwatchOptions = scope.$watch('options', onOptionsChanged, true);

      var onDatasetChanged = function(dataset) {
        var startDataChanged = new Date().getTime();
        if (jqGrid) {

          jqGrid.jqGrid('clearGridData');
          // // Bugfix : 갱신 후 undefined 행을 제거하기 위해 gridData 길이를 체크 후 빈값 할당
          if( jqGrid.get(0).p.treeGrid) {
            var perfTime = new Date().getTime();
            jqGrid.get(0).addJSONData({
              rows : dataset
            });
            console.log('addJSONData : ', new Date().getTime() - perfTime, 'ms');
          }
          else {
            jqGrid.jqGrid('setGridParam', {
              datatype: 'local',
              data: dataset,
              rowNum: dataset.length
            });
          }
          //
          // jqGrid.trigger('reloadGrid');

          console.log('onDatasetChanged : ', new Date().getTime() - startDataChanged, 'ms');

          return jqGrid.trigger('reload');

        } else {

          jqGrid = init();

        }
      };

      var unwatchDataset = scope.$watch('dataset', onDatasetChanged, false);

      /**
      * Tear Down
      */
      element.on('$destroy', function onDestroy() {
        unwatchDataset();
        unwatchOptions();
      });

    }
  };
});
