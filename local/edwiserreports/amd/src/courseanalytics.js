define([
    'jquery',
    'local_edwiserreports/variables',
    'local_edwiserreports/jquery.dataTables',
    'local_edwiserreports/dataTables.bootstrap4',
    'local_edwiserreports/common'
], function($, V) {
    function init(CONTEXTID) {
        var PageId = $("#wdm-courseanalytics-individual");
        var RecentVisits = PageId.find(".recent-visits .table");
        var RecentEnroled = PageId.find(".recent-enrolment .table");
        var RecentCompletion = PageId.find(".recent-completion .table");
        var loader = $(".loader");
        var RecentVisitsTable = null;
        var RecentEnroledTable = null;
        var RecentCompletionTable = null;

        // Varibales for cohort filter
        var cohortId = 0;
        var cohortFilterBtn   = "#cohortfilter";
        var cohortFilterItem  = cohortFilterBtn + " ~ .dropdown-menu .dropdown-item";

        $(document).ready(function() {
            var courseId = V.getUrlParameter("courseid");

            /* Select cohort filter for active users block */
            $(cohortFilterItem).on('click', function() {
                cohortId = $(this).data('cohortid');
                $(cohortFilterBtn).html($(this).text());
                getCourseAnalyticsData(courseId, cohortId);
            });

            // Get Course Analytics Data
            getCourseAnalyticsData(courseId, cohortId);
        });

        /**
         * Get Course Analytics Data
         * @param  {int} courseId Course Id
         * @param  {int} cohortId Cohort Id
         */
        function getCourseAnalyticsData(courseId, cohortId) {
            var sesskey = PageId.data("sesskey");
            $.ajax({
                url: V.requestUrl,
                type: V.requestType,
                dataType: V.requestDataType,
                data: {
                    action: 'get_courseanalytics_data_ajax',
                    sesskey: sesskey,
                    data: JSON.stringify({
                        courseid: courseId,
                        cohortid: cohortId
                    })
                },
            })
            .done(function(response) {
                /* Generate Recent Visit Table */
                RecentVisitsTable = generateDataTable(RecentVisits, RecentVisitsTable, response.data.recentvisits);

                /* Generate Recent Enrolment Table */
                RecentEnroledTable = generateDataTable(RecentEnroled, RecentEnroledTable, response.data.recentenrolments);

                /* Generate Recent Completion Table */
                RecentCompletionTable = generateDataTable(RecentCompletion, RecentCompletionTable, response.data.recentcompletions);
            })
            .fail(function(error) {
                console.log(error);
            }).always(function() {
                $(window).resize();
                PageId.fadeIn("slow");
            });
        }

        /**
         * Generate Data Table for specific blocks
         * @param  {string} tableId Table Id
         * @param  {object} table Table Object
         * @param  {array} data Data to create table
         */
        function generateDataTable(tableId, table, data) {
            var emptyStr = "No users has Enrolled in this course";
            var searchPlaceholder = "Search Analytics";

            if (tableId == RecentCompletion){
                emptyStr = "No users has completed this course";
            } else if (tableId == RecentVisits){
                emptyStr = "No users has visited this course";
            }

            if(table != null) {
                table.destroy();
            }

            loader.hide();
            tableId.fadeIn("slow");
            PageId.fadeIn("slow");

            return table = tableId.DataTable({
                data : data,
                responsive: true,
                oLanguage : {
                    sEmptyTable : emptyStr,
                    sSearchPlaceholder : searchPlaceholder
                },
                columnDefs: [
                    { className: "text-left", targets: 0 },
                    { className: "text-center", targets: "_all" }
                ],
                drawCallback: function () {
                    $('.dataTables_paginate > .pagination').addClass('pagination-sm pull-right');
                    $('.dataTables_filter').addClass('pagination-sm pull-right');
                },
                order: [[ 1, 'desc' ]],
                // scrollY: 350,
                // scrollX:true,
                // paging: true,
                bInfo : false,
                // searching : false,
                lengthChange: false,
                // paging:false
            });

            // Return table
            return table;
        }
    }

    return {
        init : init
    };
	
});
