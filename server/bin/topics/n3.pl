#!/usr/bin/perl

while (<>) {
    s/'/''/g;
    /^([^\s]+)\s*([^\s]+)\s*(.+)\s+\.\s*$/;
    my $s = $1;
    my $p = $2;
    my $o = $3;
    $s=~s/[<>]//g;
    $p=~s/[<>]//g;
    # Is it an object literal?
    if ($o=~/^\"/) {
	$o=~s/"//g;
	print "INSERT INTO triples VALUES ('$s', '$p', NULL, '$o');\n";
    } 
    else {
	$o=~s/[<>]//g;    	
	print "INSERT INTO triples VALUES ('$s', '$p', '$o', NULL);\n";
    }
}
