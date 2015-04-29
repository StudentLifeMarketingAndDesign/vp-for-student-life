<% if $BackgroundImage %>
	<div class="img-container" style="background-image: url($BackgroundImage.URL);">
		<div class="img-fifty-top"></div>
	</div>
<% end_if %>
<div class="gradient">
	<div class="container clearfix">
		<div class="white-cover"></div>
	    <section class="main-content <% if $BackgroundImage %>margin-top<% end_if %>">
        <h1>$Title</h1>
		<% if BlogEntries %>
			<% loop BlogEntries %>
				<% include BlogSummary %>
			<% end_loop %>
		<% else %>
			<p><% _t('NOENTRIES', 'There are no entries.') %></p>
		<% end_if %>
		<% include BlogPagination %>
        </section>
        <section class="sec-content hide-print">
        	<%-- include SideNav --%>
        	<% include BlogSideBar %>
        </section>
    </div>
</div>
<%-- <% include TopicsAndNews %> --%>
        
    