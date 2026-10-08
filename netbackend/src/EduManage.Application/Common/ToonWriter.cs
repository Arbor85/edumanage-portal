using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;

namespace EduManage.Application.Common;

public sealed class ToonWriter
{
    private readonly StringBuilder _sb = new();
    private int _depth;

    private string Pad => new(' ', _depth * 2);

    public ToonWriter Prop(string key, string? value)
    {
        _sb.AppendLine($"{Pad}{Key(key)}: {Val(value)}");
        return this;
    }

    public ToonWriter Prop(string key, int value)
    {
        _sb.AppendLine($"{Pad}{Key(key)}: {value}");
        return this;
    }

    public ToonWriter Prop(string key, bool value)
    {
        _sb.AppendLine($"{Pad}{Key(key)}: {(value ? "true" : "false")}");
        return this;
    }

    public ToonWriter BeginObject(string key)
    {
        _sb.AppendLine($"{Pad}{Key(key)}:");
        _depth++;
        return this;
    }

    public ToonWriter EndObject()
    {
        _depth--;
        return this;
    }

    public ToonWriter PrimitiveArray(string key, IReadOnlyList<string> values)
    {
        if (values.Count == 0)
        {
            _sb.AppendLine($"{Pad}{Key(key)}: []");
            return this;
        }
        _sb.AppendLine($"{Pad}{Key(key)}[{values.Count}]: {string.Join(",", values.Select(Val))}");
        return this;
    }

    public ToonWriter TabularArray(string key, IReadOnlyList<string> headers, IReadOnlyList<IReadOnlyList<string?>> rows)
    {
        if (rows.Count == 0)
        {
            _sb.AppendLine($"{Pad}{Key(key)}: []");
            return this;
        }
        var headerStr = string.Join(",", headers.Select(Key));
        _sb.AppendLine($"{Pad}{Key(key)}[{rows.Count}]{{{headerStr}}}:");
        foreach (var row in rows)
            _sb.AppendLine($"{Pad}  {string.Join(",", row.Select(Val))}");
        return this;
    }

    public override string ToString() => _sb.ToString();

    private static readonly Regex SimpleKeyPattern = new(@"^[A-Za-z_][A-Za-z0-9_.]*$", RegexOptions.Compiled);

    private static string Key(string k) =>
        SimpleKeyPattern.IsMatch(k) ? k : $"\"{Escape(k)}\"";

    private static string Val(string? v)
    {
        if (v is null) return "null";
        if (v.Length == 0) return "\"\"";
        if (v is "true" or "false" or "null") return $"\"{v}\"";
        if (NeedsQuoting(v)) return $"\"{Escape(v)}\"";
        return v;
    }

    private static bool NeedsQuoting(string s)
    {
        if (s[0] is '-' or '#' or ' ') return true;
        if (s[^1] == ' ') return true;
        foreach (var c in s)
            if (c is ':' or ',' or '[' or ']' or '{' or '}' or '"' or '\\' or '-' or '\n' or '\r' or '\t')
                return true;
        if (double.TryParse(s, NumberStyles.Any, CultureInfo.InvariantCulture, out _)) return true;
        return false;
    }

    private static string Escape(string s) =>
        s.Replace("\\", "\\\\").Replace("\"", "\\\"")
         .Replace("\n", "\\n").Replace("\r", "\\r").Replace("\t", "\\t");
}
