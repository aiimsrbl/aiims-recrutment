$(function(e) {
	$('#example').DataTable();
	$('#example2').DataTable();

    // Select2
    $('.dataTables_length select').select2({
        minimumResultsForSearch: Infinity,
		responsive: true,
		width: '60px'
    });
} );
