var Jsonix = require('../jsonix').Jsonix;
module.exports = 
{
	"String": function(test) {
		var t = Jsonix.Schema.XSD.String.INSTANCE;
		test.equal('test', t.print('test'));
		test.equal('test', t.parse('test'));
		test.ok(t.isInstance('string'));
		test.equal(false, t.isInstance(1));
		test.equal(2, Jsonix.Schema.XSD.Strings.INSTANCE.parse('a b').length);
		test.done();
	},
	"Integer": function(test) {
		test.equal(1, Jsonix.Schema.XSD.Integer.INSTANCE.parse('1'));
		test.equal('1', Jsonix.Schema.XSD.Integer.INSTANCE.print(1));
		test.done();
	},
	"Boolean": function(test) {
		test.equal(true, Jsonix.Schema.XSD.Boolean.INSTANCE.parse('true'));
		test.equal(true, Jsonix.Schema.XSD.Boolean.INSTANCE.parse('1'));
		test.equal(false, Jsonix.Schema.XSD.Boolean.INSTANCE.parse('false'));
		test.equal(false, Jsonix.Schema.XSD.Boolean.INSTANCE.parse('0'));
		test.equal('true', Jsonix.Schema.XSD.Boolean.INSTANCE.print(true));
		test.equal('false', Jsonix.Schema.XSD.Boolean.INSTANCE.print(false));
		try {
			Jsonix.Schema.XSD.Boolean.INSTANCE.parse('t');
			test.ok(false);
        
		} catch (e) {
			// Expected exception
		}
		test.done();
	},
	"List": function(test) {
		{
			test.equal('a b c', Jsonix.Schema.XSD.String.INSTANCE.LIST.print([ 'a', 'b', 'c' ]));
        
			var parsed = Jsonix.Schema.XSD.String.INSTANCE.LIST.parse('a b \n c');
			test.equal(3, parsed.length);
			test.equal('a', parsed[0]);
			test.equal('b', parsed[1]);
			test.equal('c', parsed[2]);
		}
		{
			test.equal('0 1 2', Jsonix.Schema.XSD.Integer.INSTANCE.LIST.print([ 0, 1, 2 ]));
        
			var parsed = Jsonix.Schema.XSD.Integer.INSTANCE.LIST.parse('0 1 2');
			test.equal(3, parsed.length);
			test.equal(0, parsed[0]);
			test.equal(1, parsed[1]);
			test.equal(2, parsed[2]);
		}
		{
			test.equal('0.1 1.2 2.3', Jsonix.Schema.XSD.Double.INSTANCE.LIST.print([ 0.1, 1.2, 2.3 ]));
        
			var parsed = Jsonix.Schema.XSD.Double.INSTANCE.LIST.parse('0.1 1.2 2.3');
			test.equal(3, parsed.length);
			test.equal(0.1, parsed[0]);
			test.equal(1.2, parsed[1]);
			test.equal(2.3, parsed[2]);
        
		}
        
		{
			var typeInfo = new Jsonix.Schema.XSD.List(Jsonix.Schema.XSD.Double.INSTANCE.LIST, null, ', ');
			test.equal('0 0, 0 1, 1 1, 1 0, 0 0', typeInfo.print([ [ 0, 0 ], [ 0, 1 ], [ 1, 1 ], [ 1, 0 ], [ 0, 0 ] ]));
        
			var parsed = typeInfo.parse('0 0, 0 1, 1 1, 1 0, 0 0');
        
			test.equal(5, parsed.length);
			test.equal(0, parsed[0][0]);
			test.equal(0, parsed[0][1]);
			test.equal(0, parsed[1][0]);
			test.equal(1, parsed[1][1]);
			test.equal(1, parsed[2][0]);
			test.equal(1, parsed[2][1]);
			test.equal(1, parsed[3][0]);
			test.equal(0, parsed[3][1]);
			test.equal(0, parsed[4][0]);
			test.equal(0, parsed[4][1]);
        
		}
		test.done();
	},
	"Decimal" : function(test) {
		// test.equal(false, Jsonix.Schema.XSD.Integer.INSTANCE.isInstance(-9223372036854775809));
		test.ok(Jsonix.Schema.XSD.Integer.INSTANCE.isInstance(-9223372036854775808));
		// test.equal(false, Jsonix.Schema.XSD.Integer.INSTANCE.isInstance(9223372036854775808));
		test.ok(Jsonix.Schema.XSD.Integer.INSTANCE.isInstance(9223372036854775807));
		test.ok(Jsonix.Schema.XSD.Byte.INSTANCE.isInstance(127));
		test.equal(false, Jsonix.Schema.XSD.Byte.INSTANCE.isInstance(128));
		test.equal(false, Jsonix.Schema.XSD.Byte.INSTANCE.isInstance('a'));
		test.done();
	},
	"NMTokens": function(test) {
		test.equal(2, Jsonix.Schema.XSD.NMTokens.INSTANCE.parse('a b').length);
		test.equal('a b', Jsonix.Schema.XSD.NMTokens.INSTANCE.print([ 'a', 'b' ]));
		test.done();
	},
	"Double": function(test) {
		test.equal(-1E4, Jsonix.Schema.XSD.Double.INSTANCE.parse('-1E4'));
		test.equal(1267.43233E12, Jsonix.Schema.XSD.Double.INSTANCE.parse('1267.43233E12'));
		test.equal(12.78e-2, Jsonix.Schema.XSD.Double.INSTANCE.parse('12.78e-2'));
		
		
		test.equal(1, Jsonix.Schema.XSD.Double.INSTANCE.parse('1'));
		test.equal(-Infinity, Jsonix.Schema.XSD.Double.INSTANCE.parse('-INF'));
		test.equal(Infinity, Jsonix.Schema.XSD.Double.INSTANCE.parse('INF'));
		test.ok(Jsonix.Util.Type.isNaN(Jsonix.Schema.XSD.Double.INSTANCE.parse('NaN')));
		test.equal('NaN', Jsonix.Schema.XSD.Double.INSTANCE.print(NaN));
		test.equal('INF', Jsonix.Schema.XSD.Double.INSTANCE.print(Infinity));
		test.equal('-INF', Jsonix.Schema.XSD.Double.INSTANCE.print(-Infinity));
		test.ok(Jsonix.Schema.XSD.Double.INSTANCE.isInstance(-1.5));
		test.ok(Jsonix.Schema.XSD.Double.INSTANCE.isInstance(0));
		test.ok(Jsonix.Schema.XSD.Double.INSTANCE.isInstance(1.5));
		test.ok(Jsonix.Schema.XSD.Double.INSTANCE.isInstance(NaN));
		test.ok(Jsonix.Schema.XSD.Double.INSTANCE.isInstance(-Infinity));
		test.ok(Jsonix.Schema.XSD.Double.INSTANCE.isInstance(Infinity));

		test.done();
	},
	"Float": function(test) {
		test.equal(1, Jsonix.Schema.XSD.Float.INSTANCE.parse('1'));
		test.equal(-Infinity, Jsonix.Schema.XSD.Float.INSTANCE.parse('-INF'));
		test.equal(Infinity, Jsonix.Schema.XSD.Float.INSTANCE.parse('INF'));
		test.ok(Jsonix.Util.Type.isNaN(Jsonix.Schema.XSD.Float.INSTANCE.parse('NaN')));
		test.equal('NaN', Jsonix.Schema.XSD.Float.INSTANCE.print(NaN));
		test.equal('INF', Jsonix.Schema.XSD.Float.INSTANCE.print(Infinity));
		test.equal('-INF', Jsonix.Schema.XSD.Float.INSTANCE.print(-Infinity));
		test.ok(Jsonix.Schema.XSD.Float.INSTANCE.isInstance(-1.5));
		test.ok(Jsonix.Schema.XSD.Float.INSTANCE.isInstance(0));
		test.ok(Jsonix.Schema.XSD.Float.INSTANCE.isInstance(1.5));
		test.ok(Jsonix.Schema.XSD.Float.INSTANCE.isInstance(NaN));
		test.ok(Jsonix.Schema.XSD.Float.INSTANCE.isInstance(-Infinity));
		test.ok(Jsonix.Schema.XSD.Float.INSTANCE.isInstance(Infinity));

		test.done();
	},
	"Calendar": function(test) {
		var ts0 = Jsonix.Schema.XSD.Calendar.INSTANCE.parse('10:20:30.4-05:06');
		test.equal(10, ts0.hour);
		test.equal(20, ts0.minute);
		test.equal(30, ts0.second);
		test.equal(0.40, ts0.fractionalSecond);
		test.equal(-306, ts0.timezone);
        
		test.equal('10:20:30.4-05:06', Jsonix.Schema.XSD.Calendar.INSTANCE.print(ts0));
        
		var ts1 = Jsonix.Schema.XSD.Calendar.INSTANCE.parse('01:02:03');
		test.equal(1, ts1.hour);
		test.equal(2, ts1.minute);
		test.equal(3, ts1.second);
		test.equal(0, ts1.fractionalSecond);
		test.ok(Jsonix.Util.Type.isNaN(ts1.timezone));
		test.equal('01:02:03', Jsonix.Schema.XSD.Calendar.INSTANCE.print(ts1));
        
		var ds0 = Jsonix.Schema.XSD.Calendar.INSTANCE.parse('2001-02-03-05:06');
		test.equal(2001, ds0.year);
		test.equal(2, ds0.month);
		test.equal(3, ds0.day);
		test.equal(-306, ds0.timezone);
		test.equal('2001-02-03-05:06', Jsonix.Schema.XSD.Calendar.INSTANCE.print(ds0));
        
		var ds1 = Jsonix.Schema.XSD.Calendar.INSTANCE.parse('-0004-02-03');
		test.equal(-0004, ds1.year);
		test.equal(2, ds1.month);
		test.equal(3, ds1.day);
		test.ok(Jsonix.Util.Type.isNaN(ds1.timezone));
		test.equal('-0004-02-03', Jsonix.Schema.XSD.Calendar.INSTANCE.print(ds1));
        
		var ds2 = Jsonix.Schema.XSD.Calendar.INSTANCE.parse('1993-02-03Z');
		test.equal(1993, ds2.year);
		test.equal(2, ds2.month);
		test.equal(3, ds2.day);
		test.equal(0, ds2.timezone);
		test.equal('1993-02-03Z', Jsonix.Schema.XSD.Calendar.INSTANCE.print(ds2));
        
		var dt0 = Jsonix.Schema.XSD.Calendar.INSTANCE.parse('2001-02-03T04:05:06');
		test.equal(2001, dt0.year);
		test.equal(2, dt0.month);
		test.equal(3, dt0.day);
		test.equal(4, dt0.hour);
		test.equal(5, dt0.minute);
		test.equal(6, dt0.second);
		test.equal('2001-02-03T04:05:06', Jsonix.Schema.XSD.Calendar.INSTANCE.print(dt0));
        
		var dt1 = Jsonix.Schema.XSD.Calendar.INSTANCE.parse('-1234-05-06T07:08:09.1011-12:13');
		test.equal(-1234, dt1.year);
		test.equal(5, dt1.month);
		test.equal(6, dt1.day);
		test.equal(7, dt1.hour);
		test.equal(8, dt1.minute);
		test.equal(9, dt1.second);
		test.equal(0.1011, dt1.fractionalSecond);
		test.equal(-733, dt1.timezone);
		test.equal('-1234-05-06T07:08:09.1011-12:13', Jsonix.Schema.XSD.Calendar.INSTANCE.print(dt1));

		test.done();
	},
	"Time": function(test) {
		var t0 = Jsonix.Schema.XSD.Time.INSTANCE.parse('10:00:00.5');
		// test.equal(32400500, t0.getTime());
		test.ok(Jsonix.Schema.XSD.Time.INSTANCE.isInstance(t0));
		test.equal(t0.getTime(), Jsonix.Schema.XSD.Time.INSTANCE.parse(Jsonix.Schema.XSD.Time.INSTANCE.print(t0)).getTime());
        
		var t1 = Jsonix.Schema.XSD.Time.INSTANCE.parse('10:00:00.5Z');
		test.equal(36000500, t1.getTime());
		test.ok(Jsonix.Schema.XSD.Time.INSTANCE.isInstance(t1));
		test.equal(t1.getTime(), Jsonix.Schema.XSD.Time.INSTANCE.parse(Jsonix.Schema.XSD.Time.INSTANCE.print(t1)).getTime());
        
		var t2 = Jsonix.Schema.XSD.Time.INSTANCE.parse('10:00:00.5+01:00');
		test.equal(32400500, t2.getTime());
		test.ok(Jsonix.Schema.XSD.Time.INSTANCE.isInstance(t2));
		test.equal(t2.getTime(), Jsonix.Schema.XSD.Time.INSTANCE.parse(Jsonix.Schema.XSD.Time.INSTANCE.print(t2)).getTime());
        
		var t3 = Jsonix.Schema.XSD.Time.INSTANCE.parse('10:00:00.5-01:00');
		test.equal(39600500, t3.getTime());
		test.ok(Jsonix.Schema.XSD.Time.INSTANCE.isInstance(t3));
		test.equal(t3.getTime(), Jsonix.Schema.XSD.Time.INSTANCE.parse(Jsonix.Schema.XSD.Time.INSTANCE.print(t3)).getTime());
        
		var t4 = Jsonix.Schema.XSD.Time.INSTANCE.parse('00:00:00.5+10:00');
		test.equal(-35999500, t4.getTime());
		test.ok(Jsonix.Schema.XSD.Time.INSTANCE.isInstance(t4));
		test.equal(t4.getTime(), Jsonix.Schema.XSD.Time.INSTANCE.parse(Jsonix.Schema.XSD.Time.INSTANCE.print(t4)).getTime());

		test.done();
	},
	"Date": function(test) {
		var d0 = Jsonix.Schema.XSD.Date.INSTANCE.parse('1970-01-01');
		test.ok(Jsonix.Schema.XSD.Date.INSTANCE.isInstance(d0));
		test.equal(d0.getTime(), Jsonix.Schema.XSD.Date.INSTANCE.parse(Jsonix.Schema.XSD.Date.INSTANCE.print(d0)).getTime());
        
		var d1 = Jsonix.Schema.XSD.Date.INSTANCE.parse('1970-01-01Z');
		test.equal(0, d1.getTime());
		test.ok(Jsonix.Schema.XSD.Date.INSTANCE.isInstance(d1));
		test.equal(d1.getTime(), Jsonix.Schema.XSD.Date.INSTANCE.parse(Jsonix.Schema.XSD.Date.INSTANCE.print(d1)).getTime());
        
		var d2 = Jsonix.Schema.XSD.Date.INSTANCE.parse('1970-01-01+01:01');
		test.equal(3660000, d2.getTime());
		test.ok(Jsonix.Schema.XSD.Date.INSTANCE.isInstance(d2));
		test.equal('1970-01-01+01:01', Jsonix.Schema.XSD.Date.INSTANCE.print(d2));
        
		var d3 = Jsonix.Schema.XSD.Date.INSTANCE.parse('1970-01-01-02:01');
		test.equal(-7260000, d3.getTime());
		test.ok(Jsonix.Schema.XSD.Date.INSTANCE.isInstance(d3));
		test.equal('1970-01-01-02:01', Jsonix.Schema.XSD.Date.INSTANCE.print(d3));
        
		test.equal('2001-12-31', Jsonix.Schema.XSD.Date.INSTANCE.print(new Date(2001, 11, 31)));
		test.equal('2001-12-31', Jsonix.Schema.XSD.Date.INSTANCE.print(Jsonix.Schema.XSD.Date.INSTANCE.parse('2001-12-31')));
		test.equal('2001-01-01', Jsonix.Schema.XSD.Date.INSTANCE.print(Jsonix.Schema.XSD.Date.INSTANCE.parse('2001-01-01')));
        
		test.equal('2001-12-29 2001-12-30 2001-12-31', Jsonix.Schema.XSD.Date.INSTANCE.LIST.print([ new Date(2001, 11, 29), new Date(2001, 11, 30), new Date(2001, 11, 31) ]));

		test.done();
	},
	"DateTime": function(test) {
		var d0 = Jsonix.Schema.XSD.DateTime.INSTANCE.parse('1970-01-01T00:00:00');
		test.ok(Jsonix.Schema.XSD.DateTime.INSTANCE.isInstance(d0));
		test.equal('1970-01-01T00:00:00', Jsonix.Schema.XSD.DateTime.INSTANCE.print(d0));
        
		var d1 = Jsonix.Schema.XSD.DateTime.INSTANCE.parse('1970-01-01T00:00:00Z');
		test.equal(0, d1.getTime());
		test.ok(Jsonix.Schema.XSD.DateTime.INSTANCE.isInstance(d1));
		test.equal(d1.getTime(), Jsonix.Schema.XSD.DateTime.INSTANCE.parse(Jsonix.Schema.XSD.DateTime.INSTANCE.print(d1)).getTime());
		
		var d2 = Jsonix.Schema.XSD.DateTime.INSTANCE.parse('1970-01-01T00:00:00+01:00');
		test.equal(3600000, d2.getTime());
		test.ok(Jsonix.Schema.XSD.DateTime.INSTANCE.isInstance(d2));
		test.equal(d2.getTime(), Jsonix.Schema.XSD.DateTime.INSTANCE.parse(Jsonix.Schema.XSD.DateTime.INSTANCE.print(d2)).getTime());
		
		var d3 = Jsonix.Schema.XSD.DateTime.INSTANCE.parse('1970-01-01T00:00:00-02:00');
		test.equal(-7200000, d3.getTime());
		test.ok(Jsonix.Schema.XSD.DateTime.INSTANCE.isInstance(d3));
		test.equal(d3.getTime(), Jsonix.Schema.XSD.DateTime.INSTANCE.parse(Jsonix.Schema.XSD.DateTime.INSTANCE.print(d3)).getTime());

		test.done();
	},
	"ID": function(test) {
		var t = Jsonix.Schema.XSD.ID.INSTANCE;
		test.equal('test', t.print('test'));
		test.equal('test', t.parse('test'));
		test.ok(t.isInstance('string'));
		test.equal(false, t.isInstance(1));
		test.done();
	},
	"IDREF": function(test) {
		var t = Jsonix.Schema.XSD.IDREF.INSTANCE;
		test.equal('test', t.print('test'));
		test.equal('test', t.parse('test'));
		test.ok(t.isInstance('string'));
		test.equal(false, t.isInstance(1));
		test.done();
	},
	"IDREFS": function(test) {
		test.equal(2, Jsonix.Schema.XSD.IDREFS.INSTANCE.parse('a b').length);
		test.done();
	}
};